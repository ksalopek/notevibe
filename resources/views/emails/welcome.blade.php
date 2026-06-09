<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Modern App</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .card {
            background-color: #1e293b;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            border: 1px solid #334155;
            text-align: center;
        }
        .header {
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            color: #f8fafc;
            font-size: 28px;
            font-weight: 700;
        }
        .header h1 span {
            color: #8b5cf6;
        }
        .content {
            margin-bottom: 30px;
            line-height: 1.6;
            color: #cbd5e1;
            font-size: 16px;
        }
        .button-container {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Welcome to <span>Our Modern App</span></h1>
            </div>
            
            <div class="content">
                <p>Hi {{ $user->name }},</p>
                <p>We are thrilled to have you on board! Your account has been successfully created, and you are now ready to start exploring all the features we have to offer.</p>
                <p>Dive in, create your first notes, and experience a seamless digital journaling process.</p>
            </div>
            
            <div class="button-container">
                <a href="{{ config('app.url') }}/dashboard" class="button">Get Started</a>
            </div>
            
            <div class="content" style="font-size: 14px; color: #94a3b8; margin-bottom: 0;">
                If you have any questions, feel free to reply to this email. We're always here to help.
            </div>
        </div>
        
        <div class="footer">
            &copy; {{ date('Y') }} Modern App. All rights reserved.<br>
            You are receiving this email because you signed up on our website.
        </div>
    </div>
</body>
</html>
