# ToDo App

A modern, responsive ToDo application built with Django, HTML, Tailwind CSS, and JavaScript.

## Features

- **Add Tasks**: Create new tasks with user name, title, description, and due date
- **View Tasks**: Display all tasks in a clean, organized list
- **Complete Tasks**: Mark tasks as complete/incomplete with confirmation popup
- **Edit Tasks**: Update task details with a modal form
- **Delete Tasks**: Remove tasks with confirmation dialog
- **Responsive Design**: Works perfectly on all screen sizes
- **Modern UI**: Clean, professional interface with smooth animations
- **Real-time Updates**: Dynamic interactions without page reloads

## Technology Stack

- **Backend**: Django 4.2.7
- **Database**: SQLite
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **API**: RESTful API with Django views
- **Styling**: Responsive design with Tailwind CSS

## Installation & Setup

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Create a superuser** (optional, for admin access):
   ```bash
   python manage.py createsuperuser
   ```

5. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

6. **Access the application**:
   - Main app: http://127.0.0.1:8000/
   - Admin panel: http://127.0.0.1:8000/admin/

## Usage

### Adding Tasks
1. Click the "Add Task" button
2. Fill in the required fields:
   - User Name
   - Task Title
   - Task Description
   - Due Date
3. Click "Save Task"

### Managing Tasks
- **Complete/Incomplete**: Click the checkbox next to a task
- **Edit**: Click the edit icon (pencil) to modify task details
- **Delete**: Click the delete icon (trash) to remove a task

### Confirmation Dialogs
- All destructive actions (delete, complete/incomplete) show confirmation popups
- Click "Yes" to confirm or "No" to cancel

## Project Structure

```
TODO/
├── manage.py
├── requirements.txt
├── README.md
├── todo_project/          # Django project settings
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── tasks/                 # Django app
│   ├── __init__.py
│   ├── admin.py
│   ├── models.py
│   ├── views.py
│   └── urls.py
├── templates/             # HTML templates
│   └── tasks/
│       └── index.html
└── static/               # Static files
    ├── css/
    └── js/
        └── app.js
```

## API Endpoints

- `GET /api/tasks/` - Get all tasks
- `POST /api/tasks/create/` - Create a new task
- `PUT /api/tasks/{id}/update/` - Update a task
- `PATCH /api/tasks/{id}/toggle/` - Toggle task completion
- `DELETE /api/tasks/{id}/delete/` - Delete a task

## Database Model

The `Task` model includes:
- `name` (CharField): User name
- `title` (CharField): Task title
- `description` (TextField): Task description
- `due_date` (DateField): Due date
- `is_completed` (BooleanField): Completion status
- `created_at` (DateTimeField): Creation timestamp

## Features in Detail

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive grid layouts
- Touch-friendly buttons and interactions
- Optimized for all screen sizes

### User Experience
- Smooth animations and transitions
- Toast notifications for user feedback
- Modal dialogs for confirmations
- Form validation and error handling
- Loading states and visual feedback

### Security
- CSRF protection
- Input sanitization
- SQL injection prevention through Django ORM
- XSS protection

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For support or questions, please open an issue in the repository. 

---

## How to Fix

### 1. **Double-Check requirements.txt**

Make sure your `requirements.txt` file is in the root of your project (the same directory as `manage.py` and `vercel.json`).

It should contain:
```
Django==4.2.7
dj-database-url
psycopg2-binary
# ...any other packages you use
```

### 2. **Commit and Push requirements.txt**

```sh
git add requirements.txt
git commit -m "Ensure dj-database-url and psycopg2-binary are in requirements"
git push
```

### 3. **Check Vercel Build Logs**

- Go to your Vercel dashboard → Deployments → Click on the latest deployment.
- In the build logs, you should see lines like:
  ```
  Installing requirements from requirements.txt
  Collecting dj-database-url
  ...
  ```
- If you do **not** see this, Vercel is not using your `requirements.txt` (maybe it's in the wrong directory).

### 4. **If requirements.txt is in a Subfolder**

If your Django project is in a subfolder (e.g., `backend/`), you need to tell Vercel to use that as the root.  
- In your Vercel dashboard, set the **Root Directory** to the folder containing `requirements.txt`.

### 5. **Add psycopg2-binary**

If you are using PostgreSQL, also add:
```
psycopg2-binary
```
to your `requirements.txt`.

---

## **Summary Table**

| Problem                                 | Solution                                 |
|------------------------------------------|------------------------------------------|
| ModuleNotFoundError: No module named 'dj_database_url' | Add `dj-database-url` to `requirements.txt` in the project root, commit, push, and redeploy |

---

## **What To Do Next**

1. Make sure `requirements.txt` is in your project root and contains `dj-database-url`.
2. Add `psycopg2-binary` if using PostgreSQL.
3. Commit and push.
4. Redeploy on Vercel.
5. Check the build logs to confirm packages are installed.

---

**Once you do this, your import error will be fixed. If you see a new error, copy the new log here and I’ll help you fix it!** 