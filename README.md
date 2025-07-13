# TODO App

A simple TODO application built with Django.

## Features

- Create, read, update, and delete tasks
- Mark tasks as completed
- Responsive design with Tailwind CSS
- RESTful API endpoints

## Local Development

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Run migrations: `python manage.py migrate`
4. Start the server: `python manage.py runserver`
5. Visit `http://127.0.0.1:8000/`

## Vercel Deployment

### Environment Variables Required

Set these environment variables in your Vercel project settings:

1. **DATABASE_URL** - PostgreSQL connection string
   ```
   postgresql://postgres:password@host:port/database
   ```

2. **DJANGO_DEBUG** - Set to False for production
   ```
   False
   ```

3. **DJANGO_SECRET_KEY** - Django secret key
   ```
   django-insecure-+5ue^_@@l82s!q1cr2+6z0$*z^vco-6pl0#%+3v2g0*s7y)0=e
   ```

### Database Setup

For production, use a PostgreSQL database service like:
- Supabase (https://supabase.com)
- Railway (https://railway.app)
- Render (https://render.com)

### Health Check

After deployment, test the health endpoint:
```
https://your-app.vercel.app/health/
```

This will verify that Django and the database are working correctly.

## API Endpoints

- `GET /api/tasks/` - Get all tasks
- `POST /api/tasks/create/` - Create a new task
- `PUT /api/tasks/<id>/update/` - Update a task
- `PATCH /api/tasks/<id>/toggle/` - Toggle task completion
- `DELETE /api/tasks/<id>/delete/` - Delete a task

## Troubleshooting

If you get 500 errors on Vercel:
1. Check that all environment variables are set
2. Verify the database connection string
3. Check Vercel function logs for specific errors
4. Test the health endpoint for detailed error information 