# WebGPU
WebGPU module 

# WebGPU Computation Dashboard

This project is a simple web interface that leverages WebGPU to perform matrix addition using GPU-based computation. The dashboard allows users to input two matrices (Matrix A and Matrix B) and see the result of their addition.

## Features
- **Matrix Input**: Users can input two matrices via text areas.
- **Computation with WebGPU**: Utilizes the power of the GPU for fast matrix addition.
- **Interactive Interface**: A clean and responsive design for a seamless experience.

## Files Overview

### 1. index.html
The main structure of the web application. It defines the layout, including:
- Two text areas for entering matrices A and B.
- A button to trigger the computation.
- A result display area.

### 2. styles.css
Provides styling for the page to make the interface user-friendly and visually appealing. Some key features include:
- A centered layout with a clean, modern design.
- Styled text areas and buttons for easy interaction.

### 3. app.js
This is the core of the project. It uses WebGPU to perform matrix addition on the GPU. The JavaScript file:
- Initializes WebGPU.
- Loads the shader for matrix addition.
- Handles buffer creation and data transfer.
- Outputs the result of the matrix addition to the console (can be expanded to show in the UI).

## How to Run

1. Clone this repository: 
2. Open `index.html` in your browser.
3. Enter values in the text areas for Matrix A and Matrix B.
4. Click the "Run Computation" button to see the result of matrix addition.

## Technologies Used
- **HTML**: Structure of the page.
- **CSS**: Styling for a clean and responsive design.
- **JavaScript**: Core logic for interacting with WebGPU and performing computations.
- **WebGPU**: High-performance computation using the GPU.

## Future Improvements
- Add functionality to handle dynamic matrix sizes.
- Display the result directly on the page instead of the console.
- Implement error handling for invalid input.

## License
This project is licensed under the MIT License.
