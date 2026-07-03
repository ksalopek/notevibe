<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NoteVibe</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f1115;
            color: #ffffff;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #0f1115;
            padding: 40px 0;
        }
        .main-container {
            max-width: 600px;
            margin: 0 auto;
            background: #161921;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #232734;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .header-brand {
            text-align: center;
            padding: 40px 20px 20px;
        }
        .header-brand h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #ffffff;
            background: -webkit-linear-gradient(45deg, #a855f7, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
        }
        .hero-image {
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, #a855f7, #3b82f6, #06b6d4);
        }
        .content-area {
            padding: 40px;
            text-align: center;
        }
        .greeting {
            font-size: 22px;
            font-weight: 600;
            color: #f3f4f6;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #9ca3af;
            margin-bottom: 35px;
        }
        .cta-wrapper {
            margin-bottom: 40px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #9333ea, #4f46e5);
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 36px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            letter-spacing: 0.5px;
            box-shadow: 0 10px 20px -5px rgba(124, 58, 237, 0.5);
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            box-shadow: 0 15px 25px -5px rgba(124, 58, 237, 0.7);
        }
        .divider {
            height: 1px;
            background-color: #232734;
            margin: 0 40px;
        }
        .footer {
            padding: 30px 40px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            line-height: 1.5;
        }
        .footer a {
            color: #a855f7;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main-container">
            <div class="hero-image"></div>
            
            <div class="header-brand">
                <h1>NOTEVIBE</h1>
            </div>
            
            <div class="content-area">
                <div class="greeting">Welcome to NoteVibe, {{ $user->name }}!</div>
                
                <div class="message">
                    We're incredibly excited to have you join our community. NoteVibe is designed to give you a seamless, elegant digital journaling experience. <br><br>
                    You're fully set up and ready to start capturing your thoughts, organizing your ideas, and vibrating on a higher level.
                </div>
                
                <div class="cta-wrapper">
                    <a href="{{ config('app.url') }}/dashboard" class="cta-button">Open Your Dashboard</a>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
                If you have any questions or need a hand getting started, simply reply to this email. Our support team is always here for you.<br><br>
                &copy; {{ date('Y') }} NoteVibe. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
