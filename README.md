# Book Locator

A community book exchange platform where readers can buy and sell books.

## Features

- **Reader Registration**: Users register as "Readers" and await Admin approval.
- **Admin Dashboard**: Admins approve/reject reader registrations and manage the platform.
- **Book Listings**: Approved readers can list books for sale.
- **Location Privacy**: Approximate locations are used to find nearby books without revealing exact addresses.
- **Requests**: Readers can request to buy books.

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: MongoDB

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Workflow

1.  **Register**: Go to `/auth/register` to create an account.
2.  **Approval**: Admin logs in and approves the new reader.
3.  **Login**: Once approved, the reader can log in.
4.  **Share**: Readers can list books via "My Books".
5.  **Browse**: Readers can browse and request books.
