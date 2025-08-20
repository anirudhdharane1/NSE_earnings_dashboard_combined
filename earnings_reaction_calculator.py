

#Latest
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import timedelta, datetime
import matplotlib.pyplot as plt

def extract_dates_times_from_text(text):
    # Pattern for 'DD MMM YYYY HH:MM', e.g. '18 Jul 2025 19:33'
    pattern = r"(\d{1,2} [A-Za-z]{3} \d{4})\s+(\d{2}:\d{2})"
    matches = re.findall(pattern, text)
    dates_with_times = []
    for dt_str, time_str in matches:
        try:
            dt_obj = datetime.strptime(dt_str, "%d %b %Y")
            date_formatted = dt_obj.strftime("%Y-%m-%d")
            dates_with_times.append((date_formatted, time_str))
        except ValueError:
            continue
    return dates_with_times

# Helper function to adjust Saturday dates to next Monday
def adjust_dates_for_saturday(dates):
    adjusted_dates = []
    adjustments = {}  # Track changes for output notes
    for date_str in dates:
        date = pd.to_datetime(date_str)
        original_date = date.strftime('%Y-%m-%d')
        if date.weekday() == 5:  # Saturday
            date += timedelta(days=2)  # Next Monday
            adjustments[original_date] = date.strftime('%Y-%m-%d')
        adjusted_dates.append(date)
    return adjusted_dates, adjustments

# Helper function to adjust dates based on time > 15:15 (after Saturday adjustment, skipping Saturday-adjusted ones)
def adjust_dates_for_time(adjusted_dates, times, saturday_adjustments):
    final_dates = []
    time_adjustments = {}  # Track time-based changes
    original_dates = sorted(dates)  # Assuming 'dates' is accessible; original sorted dates

    for i, date in enumerate(adjusted_dates):
        original_date = original_dates[i]
        time_str = times[i]

        # Skip time adjustment if this date was adjusted for Saturday
        if original_date in saturday_adjustments:
            final_dates.append(date)
            continue

        try:
            # Parse time (military format, e.g., "15:30" -> datetime.time)
            time_obj = datetime.strptime(time_str, "%H:%M").time()
            threshold_time = datetime.strptime("15:15", "%H:%M").time()
            if time_obj > threshold_time:
                date += timedelta(days=1)  # Shift to next date
                time_adjustments[original_date] = date.strftime('%Y-%m-%d')
        except ValueError:
            print(f"Invalid time format for {original_date}: {time_str}. Skipping time adjustment.")

        final_dates.append(date)
    return final_dates, time_adjustments

# Function to calculate price change and get OHLC for given dates (handles far-apart dates)
def price_changes_for_dates(stock_symbol, dates_with_times, window_days=7, max_fallback_attempts=10):
    # Extract dates and times from input tuples, sort by date
    sorted_pairs = sorted(dates_with_times, key=lambda x: pd.to_datetime(x[0]))
    global dates  # Make dates global for access in helpers (temporary workaround)
    dates = [pair[0] for pair in sorted_pairs]
    times = [pair[1] for pair in sorted_pairs]

    # First, adjust for Saturdays
    adjusted_dates, saturday_adjustments = adjust_dates_for_saturday(dates)

    # Then, adjust for time > 15:15, skipping Saturday-adjusted dates
    final_dates, time_adjustments = adjust_dates_for_time(adjusted_dates, times, saturday_adjustments)
    final_dates = pd.to_datetime(final_dates)  # Ensure datetime format

    results = []
    na_fallback_adjustments = {}  # Track N/A fallback increments

    for i, date in enumerate(final_dates):
        original_date = dates[i]  # For output reference
        attempt_date = date  # Start with final adjusted date
        initial_attempt_date = attempt_date  # For tracking if adjustment happens
        data_fetched = False
        attempts = 0

        while attempts < max_fallback_attempts:
            attempts += 1
            # Define small fetch range: window_days before the date to the date itself
            start_date = (attempt_date - timedelta(days=window_days)).strftime('%Y-%m-%d')
            end_date = (attempt_date + timedelta(days=1)).strftime('%Y-%m-%d')  # +1 to include the date

            # Download historical data for this small range (add .NS for NSE stocks), suppress warning
            data = yf.download(stock_symbol + ".NS", start=start_date, end=end_date, auto_adjust=False)

            # Flatten multi-index columns if present
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = data.columns.get_level_values(0)

            if data.empty or attempt_date not in data.index:
                # No data: increment date by 1 and continue
                attempt_date += timedelta(days=1)
                continue

            # Get the row for the current date using loc
            current_row = data.loc[attempt_date]

            # Safely extract OHLC, handling possible casing variations
            open_price = current_row.get('Open', current_row.get('open', None))
            high_price = current_row.get('High', current_row.get('high', None))
            low_price = current_row.get('Low', current_row.get('low', None))
            close_price = current_row.get('Close', current_row.get('close', None))

            if close_price is None:  # No valid close: increment and continue
                attempt_date += timedelta(days=1)
                continue

            # Valid data found
            data_fetched = True

            # Find the last non-NaN close before this date, checking both casings
            close_col = 'Close' if 'Close' in data.columns else 'close' if 'close' in data.columns else None
            if close_col is None:
                attempt_date += timedelta(days=1)
                continue

            prev_data = data[data.index < attempt_date].dropna(subset=[close_col])
            if not prev_data.empty:
                prev_close = prev_data[close_col].iloc[-1]
                # Calculate percentage change
                price_change = ((close_price - prev_close) / prev_close) * 100
                results.append((original_date, round(price_change, 2), round(open_price, 2) if open_price else None,
                                round(high_price, 2) if high_price else None, round(low_price, 2) if low_price else None,
                                round(close_price, 2)))
            else:
                # Still include OHLC even if no previous close
                results.append((original_date, None, round(open_price, 2) if open_price else None,
                                round(high_price, 2) if high_price else None, round(low_price, 2) if low_price else None,
                                round(close_price, 2)))
            break  # Successful fetch

        if not data_fetched:
            results.append((original_date, None, None, None, None, None))

        # Record fallback if adjustment happened
        if attempt_date != initial_attempt_date:
            na_fallback_adjustments[original_date] = f"{initial_attempt_date.strftime('%Y-%m-%d')} (original adjusted) -> {attempt_date.strftime('%Y-%m-%d')}"

    # Print any adjustments made
    if saturday_adjustments or time_adjustments or na_fallback_adjustments:
        print("Date Adjustments:")
        for orig, adj in saturday_adjustments.items():
            print(f"Saturday Adjustment: {orig} -> {adj}")
        for orig, adj in time_adjustments.items():
            print(f"Time Adjustment (>15:15): {orig} -> {adj}")
        for orig, adj in na_fallback_adjustments.items():
            print(f"N/A Fallback Adjustment: {orig} {adj}")

    return results

# Example usage with your date-time pairs
'''stock_symbol = "BPCL"  # Without .NS, as it's added in the function
dates_with_times = extract_dates_times_from_text(ocr_texttext)
dates_with_times = [
    ("2025-04-29", "15:50"),
    ("2025-01-23", "11:25"),
    ("2024-10-25", "17:37"),
    ("2024-07-19", "20:10"),
    ("2024-05-10", "12:34"),
    ("2024-01-29", "13:40"),
    ("2023-10-27", "19:30"),
    ("2023-07-26", "14:38"),
    ("2023-05-22", "20:40"),
    ("2023-01-30", "17:39"),
    ("2022-11-07", "21:18"),
    ("2022-08-06", "19:32"),
    ("2022-05-26", "14:28"),
    ("2022-01-31", "17:20"),
    ("2021-10-29", "18:01"),
    ("2021-08-12", "15:30"),
    ("2021-05-26", "19:40"),
]


price_changes = price_changes_for_dates(stock_symbol, dates_with_times)

# Print results neatly with OHLC
print("Date\t\tPrice Change (%)\tOpen\tHigh\tLow\tClose")
for date, change, open_p, high_p, low_p, close_p in price_changes:
    change_str = f"{change:.2f}" if change is not None else "N/A"
    open_str = f"{open_p:.2f}" if open_p is not None else "N/A"
    high_str = f"{high_p:.2f}" if high_p is not None else "N/A"
    low_str = f"{low_p:.2f}" if low_p is not None else "N/A"
    close_str = f"{close_p:.2f}" if close_p is not None else "N/A"
    print(f"{date}\t{change_str}\t\t{open_str}\t{high_str}\t{low_str}\t{close_str}")

# Calculate and display statistics on absolute price changes
valid_changes = [change for _, change, _, _, _, _ in price_changes if change is not None]
total_input_dates = len(dates_with_times)  # Number of input dates
print(f"\nTotal input dates: {total_input_dates}")

if valid_changes:
    abs_changes = np.abs(valid_changes)
    mean_abs = np.mean(abs_changes)
    std_abs = np.std(abs_changes)
    mean_plus_1sigma = mean_abs + std_abs
    mean_plus_2sigma = mean_abs + (2 * std_abs)
    mean_plus_3sigma = mean_abs + (3 * std_abs)

    # Count how many absolute changes exceed thresholds
    exceed_1sigma_count = np.sum(abs_changes > mean_plus_1sigma)
    exceed_2sigma_count = np.sum(abs_changes > mean_plus_2sigma)

    print("Statistics on Absolute Price Changes (%):")
    print(f"Absolute Mean: {mean_abs:.2f}")
    #\u03c3 --> sigma character
    print(f"First Standard Deviation (1 sigma ): {mean_plus_1sigma:.2f}")
    print(f"Second Standard Deviation (2 sigma): {mean_plus_2sigma:.2f}")
    print(f"Third Standard Deviation (3 sigma): {mean_plus_3sigma:.2f}")
    print(f"Number of occasions where absolute price change exceeded (mean + 1sigma): {exceed_1sigma_count}")
    print(f"Number of occasions where absolute price change exceeded (mean + 2sigma): {exceed_2sigma_count}")
else:
    print("No valid price changes available for statistics calculation.")



import matplotlib.pyplot as plt
import numpy as np

# Assume price_changes is your existing list of tuples (date, change, open, high, low, close)
percent_changes = [change for _, change, _, _, _, _ in price_changes if change is not None]

# Define bins from -10% to +10%
bins = list(range(-7, 8, 1))

# Calculate absolute mean and std for standard deviation lines (optional)
abs_changes = np.abs(percent_changes)
mean_abs = np.mean(abs_changes)
std_abs = np.std(abs_changes)

plt.figure(figsize=(10, 6), facecolor='#2f2f2f')
ax = plt.gca()
ax.set_facecolor('#2f2f2f')

# Plot histogram bars
n, bins_edges, patches = plt.hist(percent_changes, bins=bins, edgecolor='black', color='#00FF00', alpha=1)

# Calculate bin centers from edges for plotting line
bin_centers = 0.5 * (bins_edges[:-1] + bins_edges[1:])

# Overlay line connecting top of bars (peaks)

# Add grid, labels, and title
plt.grid(axis='y', color='lightgrey', linestyle='-', linewidth=0.7, alpha=0.5)
plt.xticks(bins, color='white')
plt.yticks(color='white')
plt.xlabel('Percentage Price Change (%)', color='white')
plt.ylabel('Frequency', color='white')
plt.title('Distribution of Stock Price Changes After Earnings', color='white')

# Vertical line at 0%
plt.axvline(x=0, color='white', linestyle='-', linewidth=1, alpha=0.6)

# Standard deviation markers (vertical lines)
plt.axvline(x=mean_abs, color='yellow', linestyle='-', linewidth=1.5, label='1sigma', alpha=0.5)
plt.axvline(x=-mean_abs, color='yellow', linestyle='-', linewidth=1.5, alpha=0.5)
plt.axvline(x=2 * std_abs, color='orange', linestyle='-', linewidth=1.5, label='2sigma',alpha=0.5)
plt.axvline(x=-2 * std_abs, color='orange', linestyle='-', linewidth=1.5, alpha=0.5)
plt.axvline(x=3 * std_abs, color='red', linestyle='-', linewidth=1.5, label='3sigma', alpha=0.5)
plt.axvline(x=-3 * std_abs, color='red', linestyle='-', linewidth=1.5, alpha=0.5)

plt.legend()

plt.show()'''


