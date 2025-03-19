export const htmlContent = (
  otp: string,
  expirationTime: string,
  isUpdate: boolean
) => {
  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Verification Code</title>
    <style>
        /* Reset styles for email clients */
        body,
        html {
            margin: 0;
            padding: 0;
            width: 100%;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: black;
            background-color: #f9f9f9;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        td {
            padding: 0;
        }

        /* Main email styles */
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }

        .header {
            background-color: black;
            text-align: center;
            border-bottom: 1px solid #eee;
            padding: 20px 0;
        }

        .logo {
            font-size: 30px;
            font-weight: bold;
            margin: 0;
            color: white;
        }

        .content {
            padding: 30px 20px;
            text-align: center;
        }

        .verification-code {
            color: teal;
            font-family: 'Courier New', monospace;
            font-size: 36px;
            font-weight: bold;
            background-color: #F8FAFC;
            border-radius: 6px;
            padding: 15px 30px;
            display: inline-flex;
            /* Use flexbox to center */
            justify-content: center;
            /* Center horizontally */
            align-items: center;
            /* Center vertically */
            width: fit-content;
            /* Only take up necessary space */
            margin: 0 auto;
            /* Center within the container */
            letter-spacing: 25px;
            /* Adjust this value for the desired gap between digits */
            text-indent: 25px;
            /* Compensate for the letter-spacing to ensure true centering */
        }

        .message {
            margin-bottom: 30px;
            font-size: 16px;
        }

        .footer {
            text-align: center;
            padding: 5px;
            border-top: 1px solid #eee;
            color: #888;
            font-size: 12px;
        }

        .expiry {
            color: #666;
            font-style: italic;
        }

        .support {
            font-size: 14px;
        }

        .email-link {
            text-decoration: none;
            color: teal;
        }

        .email-link:hover {
            text-decoration: underline;
        }

        /* Responsive adjustments */
        @media screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                border-radius: 0;
            }

            .verification-code {
                font-size: 28px;
            }
        }
    </style>
</head>

<body>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%"
        style="max-width: 600px; margin: 20px auto;">
        <tr>
            <td>
                <div class="container">
                    <div class="header">
                        <p class="logo">Endurofy</p>
                    </div>
                    <div class="content">
                        <h1>Verify Your Email</h1>
                        <p class="message">
                            ${
                              isUpdate
                                ? "To finalize your email update, please enter the verification code below to confirm your new email address."
                                : "Thanks for signing up! To complete your registration, please use the verification code below."
                            }
                        </p>

                        <div class="verification-code">${otp}</div>

                        <p class="expiry">This code will expire in ${expirationTime}.</p>

                        <p>If you didn't request this code, you can safely ignore this email.</p>

                        <div class="support">
                            Need help? Contact our support team at <a href="mailto:endurofy@gmail.com"
                                class="email-link">endurofy@gmail.com</a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 Endurofy. All rights reserved.</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>

</html>`;
};
