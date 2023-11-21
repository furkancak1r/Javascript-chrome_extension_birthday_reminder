# Birthday Reminder Chrome Extension

The Birthday Reminder Chrome Extension allows users to sign in with their Google account and view their associated email address. Users can choose to add information about friends, family, or acquaintances, including their names and birthdates. This data is stored in MongoDB for easy retrieval.

## Features

- **Google Account Integration:**
  - Users sign in with their Google accounts.

- **User Profile Management:**
  - View the signed-in email address.
  - Add names and birthdates of friends or family.

- **Automatic Birthday Reminders:**
  - Open a new tab with a gift box reminder on the specified person's birthday.
  - Display a personalized birthday message under the user's name.
  - Send a reminder email to the user at 8 AM on the birthday.

## Application Structure

The application consists of both client and server components.

### Client

The Chrome extension serves as the client, providing a user interface for sign-in, profile management, and birthday reminders.

### Server

The server handles user data storage in MongoDB and facilitates the reminder functionality.

## How to Use

1. **Install the Chrome Extension:**
   - Load the extension in Chrome by navigating to chrome://extensions/.
   - Enable "Developer mode" and click "Load unpacked." Select the extension folder.

2. **Sign In:**
   - Sign in with your Google account using the extension.

3. **Add Birthdays:**
   - Navigate to the extension popup and add friends or family members' names and birthdates.

4. **Receive Reminders:**
   - On the specified person's birthday, a new tab with a gift box reminder will automatically open.
   - A personalized birthday message will be displayed under your name.
   - An email reminder will be sent at 8 AM on the birthday.

## MongoDB Setup

Ensure you have a MongoDB instance running and configure the connection details in the server code.

## Disclaimer

This extension is intended for personal use and reminders. Ensure to use it responsibly and respect privacy.


