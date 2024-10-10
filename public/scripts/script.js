const messages = [
    "Explore the latest in AI and Blockchain at our Webinars!",
    "Join our upcoming Hackathons and Bootcamps!",
    "Stay ahead with our cutting-edge Conferences.",
    "Learn new skills in our engaging Workshops.",
    "Don't miss out on  tech events happening near you."
];

let messageIndex = 0; // Current sentence index
let charIndex = 0; // Current letter index
let currentMessage = ''; // The message being displayed
const typeSpeed = 100; // Speed at which each letter appears
const delayBetweenMessages = 2000; // Time to wait before showing the next message
const headingElement = document.getElementById('dynamic-heading');

// Function to type out each letter
function typeWriter() {
    if (charIndex < currentMessage.length) {
        headingElement.textContent += currentMessage.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, typeSpeed); // Call the function again to type the next letter
    } else {
        // After the entire sentence is written, wait a while and then change to the next message
        setTimeout(() => {
            charIndex = 0;
            messageIndex = (messageIndex + 1) % messages.length; // Move to the next message
            currentMessage = messages[messageIndex];
            headingElement.textContent = ''; // Clear the heading for the next message
            typeWriter(); // Start typing the next message
        }, delayBetweenMessages);
    }
}

// Start typing the first message when the page loads
currentMessage = messages[messageIndex];
typeWriter();