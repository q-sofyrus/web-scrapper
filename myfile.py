import pandas as pd

# Load the CSV file
csv_file_path = 'C:/Users/Moon Computers/Desktop/my-crawler/.csv'  # Update this with the path to your CSV file
df = pd.read_csv(csv_file_path)

# Check for duplicate rows
print(f"Original number of rows: {df.shape[0]}")
duplicates = df[df.duplicated()]
# Print the duplicates (if any)
if not duplicates.empty:
    print(f"Number of duplicate rows: {len(duplicates)}")
    print("Duplicate rows:")
    print(duplicates)
else:
    print("No duplicate rows found.")

#df['Date Of Creation'] = pd.to_datetime(df['Date Of Creation'])
#filtered_records = df[df['Date Of Creation'] < '2010-01-01']
print(df['Date Of Creation'].head(10))  # Check original values

# Convert the 'Date Of Creation' column, assuming they are years
df['Date Of Creation'] = pd.to_datetime(df['Date Of Creation'].astype(str), format='%Y', errors='coerce')

# Print the cleaned 'Date Of Creation' column
print(df['Date Of Creation'])

# Filter records with dates before '2010-01-01'
#filtered_records = df[df['Date Of Creation'] < '2010-01-01']

# Print filtered records
#print(filtered_records['Date Of Creation'])

# # Store 'Date Of Creation' column in a separate file
# date_of_creation = df[['Date Of Creation']]  # Selecting the column

# # Save to a new CSV file
# date_of_creation.to_csv('date_of_creation.csv', index=False)

# print("Date Of Creation column has been saved to 'date_of_creation.csv'")

# df['Date Of Creation'] = pd.to_datetime(df['Date Of Creation'], errors='coerce')
# filtered_df = df[df['Date Of Creation'] > '2010-01-01' ]
# print("\nFiltered rows where  Date Of Creation  gt 50:")
# print(filtered_df)
# filtered_df.to_csv('C:/Users/Moon Computers/Desktop/my-crawler/keyword_data/Catalog of photographs/data.csv', index=False)

