# Holberton School AirBnB Clone - Part 4: Web Client and Back-End Integration

This folder contains the implementation of the web client and back-end integration for the AirBnB clone project. It builds upon the previous parts by adding a fully functional front-end and connecting it to the back-end API.

---

## Project Structure

### Base Files (`base_files/`)
- **HTML Files**:
  - `index.html`: Displays a list of available places with filtering options.
  - `place.html`: Shows detailed information about a specific place, including reviews and amenities.
  - `add_review.html`: Allows users to submit reviews for a specific place.
  - `login.html`: Provides a login form for user authentication.

- **CSS Files**:
  - `styles.css`: Contains the styles for the web client, including layouts for places, reviews, and forms.

- **JavaScript Files**:
  - `scripts.js`: Implements the front-end logic, including:
    - Fetching and displaying places.
    - Submitting reviews.
    - User authentication and session management.
    - Dynamic DOM manipulation for filtering and displaying content.

### Back-End (`back-end/`)
- **API Endpoints (`app/api/v1/`)**:
  - `users.py`: Handles user-related operations such as login and updates.
  - `places.py`: Manages place-related operations, including fetching details and creating places.
  - `reviews.py`: Handles review-related operations, such as fetching and submitting reviews.
  - `amenities.py`: Manages amenities associated with places.

- **Services (`app/services/`)**:
  - `facade.py`: Provides a unified interface for interacting with repositories and models.

- **Persistence Layer (`app/persistence/`)**:
  - `repository.py`: Implements repositories for interacting with the database using SQLAlchemy.

- **Database (`database/`)**:
  - `schema.sql`: Defines the database schema, including tables for users, places, reviews, and amenities.
  - `initial_data.sql`: Populates the database with initial data for testing.

---

## Features

### Front-End
- **Place Listing**:
  - Displays a list of places with their details (title, price, and description).
  - Allows filtering places by price using a dropdown menu.

- **Place Details**:
  - Shows detailed information about a specific place, including its amenities and reviews.
  - Allows users to submit reviews if authenticated.

- **User Authentication**:
  - Provides a login form for users to authenticate.
  - Displays different UI elements based on the user's authentication status.

- **Review Submission**:
  - Authenticated users can submit reviews for specific places.
  - Reviews include a rating (1-5) and a text description.

### Back-End
- **API Endpoints**:
  - Provides RESTful endpoints for managing users, places, reviews, and amenities.
  - Implements JWT-based authentication for secure access.

- **Database Integration**:
  - Uses SQLAlchemy for ORM and database interactions.
  - Supports CRUD operations for all entities.

---

## Getting Started

### Prerequisites
- Python 3.8+
- Flask and Flask extensions (`flask-restx`, `flask-jwt-extended`, `flask-cors`)
- Node.js (for front-end development)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/holberton-school-airbnb.git
   cd holberton-school-airbnb/part4