import pandas as pd

# Load the CSV file
csv_file_path = 'C:/Users/Moon Computers/Desktop/New folder/scraped_dataa.csv'  # Update this with the path to your CSV file
df = pd.read_csv(csv_file_path)

# Check for duplicate rows
print(f"Original number of rows: {df.shape[0]}")
duplicates = df[df.duplicated()]
print(f"Number of duplicate rows: {duplicates.shape[0]}")

#If duplicates exist, remove them
if not duplicates.empty:
    # Remove duplicate rows
    df_cleaned = df.drop_duplicates()
    
    # Display number of rows after removing duplicates
    print(f"Number of rows after removing duplicates: {df_cleaned.shape[0]}")
    
    # Overwrite the original CSV file with the cleaned data
    df_cleaned.to_csv('Scrapped-dataa-update.csv', index=False)
    print(f"Duplicate rows removed, and file has been updated.")
else:
    print("No duplicate rows found. No changes made to the file.")
