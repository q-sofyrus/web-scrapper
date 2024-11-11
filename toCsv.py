import sqlite3
import csv

def export_to_csv(db_path, query, csv_path):
    # Connect to the SQLite database
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()

    try:
        # Execute the query to fetch data
        cursor.execute(query)
        
        # Fetch all rows from the query result
        rows = cursor.fetchall()

        # Get column names from the cursor description
        column_names = [description[0] for description in cursor.description]

        # Write data to CSV file
        with open(csv_path, mode='w', newline='', encoding='utf-8') as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(column_names)  # Write the header
            writer.writerows(rows)          # Write the data rows

        print(f'Data exported successfully to {csv_path}')

    except sqlite3.Error as e:
        print(f'Error occurred: {e}')

    finally:
        # Close the database connection
        cursor.close()
        connection.close()

# Example usage
if __name__ == '__main__':
    db_path = 'uscodata.db'  # Path to your SQLite database
    query = 'SELECT * FROM data_table'  # Your SQL query
    csv_path = 'uscodata.csv'  # Path for the output CSV file

    export_to_csv(db_path, query, csv_path)
