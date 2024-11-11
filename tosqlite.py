import sqlite3
import csv

# Define the CSV and SQLite file paths
csv_file_path = 'Visual-Material-data.csv'  # Replace with your actual CSV file path
sqlite_db_path = 'visual_data.db'  # Replace with your SQLite database file path

try:
    # Connect to the SQLite database (or create it if it doesn't exist)
    conn = sqlite3.connect(sqlite_db_path)
    cursor = conn.cursor()

    # # Create a table with all columns set to TEXT type
    create_table_query = '''
    CREATE TABLE IF NOT EXISTS data_table(
        Name TEXT,
        Email TEXT,
        Registration_Number TEXT UNIQUE,
        Title TEXT,
        Description TEXT,
        Copyright_Claimant TEXT,
        Date_Of_Creation TEXT,
        Rights_And_Permission TEXT
     );
    '''
    cursor.execute(create_table_query)
    print("Table created successfully!")

    # Check for existing tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Existing tables:", tables)

    # Open and read the CSV file, then insert each row into the database
    with open(csv_file_path, 'r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        row_count = 0
        
        for row in csv_reader:
            cursor.execute(''' 
                INSERT OR IGNORE INTO data_table (
                    Name, Email, Registration_Number, Title, Description, 
                    Copyright_Claimant, Date_Of_Creation, Rights_And_Permission, Photographs
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                row['Name(s)'],
                row['Email'],
                row['Registration Number'],
                row['Title'],
                row['Description'],
                row['Copyright Claimant'],
                row['Date Of Creation'],
                row['Rights And Permission']
            ))
            row_count += 1

    # Commit changes
    conn.commit()
    print(f"{row_count} rows imported successfully!")

except sqlite3.Error as e:
    print(f"An error occurred: {e}")
finally:
    # Ensure the connection is closed
    if conn:
        conn.close()
