/* eslint-disable prettier/prettier */
document.getElementById('scraperForm').addEventListener('submit', function(event) {
    // Allow the form to submit and navigate to the /progress route
    event.preventDefault(); // Prevent default form submission if you want to handle it manually

     const category = document.getElementById('categoryInput').value;
    const alphabet = document.getElementById('alphabetInput').value;
    const totalRecords = document.getElementById('totalRecordsInput').value;

    // Prepare the form data
    const formData = new FormData();
     formData.append('category', category);
    formData.append('alphabet', alphabet);
    formData.append('totalRecords', totalRecords);

    // You can redirect to /progress directly:
    const actionUrl = '/progress'; // Set the action URL for the form

    // Create a new form submission to the action URL
    const form = document.createElement('form');
    form.method = 'GET'; // or POST if you intend to send data
    form.action = actionUrl;

    // Append the data
    for (const [key, value] of formData.entries()) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit(); // Submit the form to navigate to the progress route
});
