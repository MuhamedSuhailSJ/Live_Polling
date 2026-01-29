🛠 Tech Stack

    Frontend: React.js, TypeScript, CSS

    Backend: Node.js, Express.js

    Real-time Engine: Socket.io

    State Management: Local State (React Hooks) & Context-free Architecture

    Persistence: Local Storage (for session/tab identity)

✨ Features
👨‍🏫 Teacher Persona

    Poll Creation: Generate unique poll sessions instantly.

    Live Questioning: Create multiple-choice questions (2–6 options) on the fly.

    Timer Control: Set custom time limits for questions (15s, 30s, 45s, 60s).

    Real-Time Monitoring: Watch student answers come in live.

    Participant Management: View connected students and kick disruptive users.

    History Tracking: Review all past questions and result analytics.

    Chat: Communicate with the entire class via the integrated chat widget.

👨‍🎓 Student Persona

    Easy Join: Join sessions using a unique name.

    Tab Identity: Unique identity maintained per browser tab via Local Storage.

    Live Interaction: Questions appear instantly when launched by the teacher.

    Instant Feedback: View results immediately after the timer ends or upon submission.

    Chat: Ask questions or chat with the class.

    Ban Protection: Kicked students receive a temporary 10-minute ban.

⚙️ Core System Features

    WebSocket Synchronization: All interactions (joining, answering, chatting) happen in real-time.

    Responsive UI: Fully optimized for both desktop and mobile devices.

    Error Handling: Comprehensive user feedback for connection issues or invalid actions.

    Ban System: Server-side enforcement of temporary bans using tab IDs.

📡 API Documentation
REST Endpoints
Method	Endpoint	Description	Payload / Params
POST	/api/poll	Create a new poll session	None
GET	/api/poll	Get current poll state	None
POST	/api/poll/join	Join a poll as a student	{ name, tabId }
POST	/api/poll/questions	Add a new question (Teacher)	{ question, options, timerSec }
GET	/api/poll/ban/check	Check ban status	?tabId=...
Socket.io Events (Client → Server)
Event Name	Description	Payload Required
joinPoll	Join the socket room	{ userType, studentId, name }
submitAnswer	Submit an answer	{ studentId, questionId, answer }
requestResults	Fetch results for specific Q	{ questionId }
chat:message	Send a message	{ userId, userType, name, text, ts }
participant:kick	Kick a student	{ studentId }
🚀 Usage Guide
For Teachers

    Start: Navigate to the homepage and select "I'm a Teacher".

    Create: Click "Continue" to generate a unique session.

    Ask: Use the dashboard to type a question, add options, and select a timer (15-60s).

    Monitor: Watch as students join the "Participants" list and submit answers.

    Manage: Use the Chat widget to talk or kick disruptive students (kicked students are banned for 10 mins).

    Review: Access "Poll History" to see analytics of previous questions.

For Students

    Join: Navigate to the homepage and select "I'm a Student".

    Identity: Enter your name.

    Wait: You will be placed in a waiting room until the teacher launches a question.

    Answer: Select an option before the timer runs out.

    Results: View the class results once the question concludes.
