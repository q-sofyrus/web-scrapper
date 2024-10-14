/* eslint-disable prettier/prettier */
document.getElementById('scraperForm').addEventListener('submit', function(event) {
    // Allow the form to submit and navigate to the /progress route
    event.preventDefault(); // Prevent default form submission if you want to handle it manually
    console.log('we are inside script file...');
    const category = document.getElementById('categoryInput').value;
    const alphabet = document.getElementById('alphabetInput').value;
    const urlStart = document.getElementById('urlOffsetStart').value;
    const urlEnd = document.getElementById('urlOffsetEnd').value;

    console.log(category.toLowerCase(),alphabet.toLowerCase(),urlStart,urlEnd);
    document.getElementById('spinnerContainer').innerText=''
    const   element=document.createElement('div');
        element.classList.add('spinner')
        document.getElementById('spinnerContainer').appendChild(element);

    // Prepare the form data
    makeRequest(category,alphabet,urlStart,urlEnd)
})

async  function makeRequest(category, alphabet,urlStart,urlEnd)
{
    alpha=['l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
    try {
        for(let i=0; i<15; i++){
         response = await fetch(`/scrapper/fetch-registration?category=${encodeURIComponent(category)}&alpha=${encodeURIComponent(alpha[i])}&urlStart=${encodeURIComponent(urlStart)}&urlEnd=${encodeURIComponent(urlEnd)}`);
        
         setTimeout(() => {
            console.log('This message will be logged after 5 seconds.');
        }, 5000);
        
        }
         if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        if(data){
            document.getElementById('spinnerContainer').innerText='All registration numbers are fetched successfully!'
            //document.getElementById('spinnerContainer').style.display='block'
        }
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}