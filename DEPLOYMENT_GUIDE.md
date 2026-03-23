# Deployment Guide for Meet Clone

This application consists of two parts that need to be deployed separately:
1. **Frontend (React)** - Deploy on Vercel
2. **Backend (Node.js + Socket.io)** - Deploy on Render, Railway, or Heroku

## Why Separate Deployments?

Vercel is optimized for static sites and serverless functions, but doesn't support long-running WebSocket connections needed for Socket.io. Therefore, you need to deploy the backend on a platform that supports WebSocket servers.

---

## Part 1: Deploy Backend (Node.js Server)

### Option A: Deploy on Render (Recommended - Free Tier Available)

1. **Go to Render**: https://render.com
2. **Sign up/Login** with your GitHub account
3. **Click "New +"** → Select "Web Service"
4. **Connect your repository**: johnny-ops/meet-me
5. **Configure the service**:
   - **Name**: meet-clone-backend
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

6. **Add Environment Variables**:
   - Click "Advanced" → "Add Environment Variable"
   - Add: `PORT` = `4000`
   - Add: `CLIENT_URL` = `https://your-vercel-app.vercel.app` (you'll update this later)

7. **Click "Create Web Service"**
8. **Wait for deployment** (takes 2-5 minutes)
9. **Copy your backend URL**: It will be something like `https://meet-clone-backend.onrender.com`

### Option B: Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Click "New Project"** → "Deploy from GitHub repo"
4. **Select**: johnny-ops/meet-me
5. **Configure**:
   - **Root Directory**: server
   - **Start Command**: npm start
6. **Add Environment Variables**:
   - `PORT` = `4000`
   - `CLIENT_URL` = (your Vercel URL)
7. **Deploy** and copy the generated URL

### Option C: Deploy on Heroku

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli
2. **Login to Heroku**:
   ```bash
   heroku login
   ```
3. **Create a new app**:
   ```bash
   heroku create meet-clone-backend
   ```
4. **Deploy**:
   ```bash
   git subtree push --prefix server heroku main
   ```
5. **Set environment variables**:
   ```bash
   heroku config:set CLIENT_URL=https://your-vercel-app.vercel.app
   ```

---

## Part 2: Deploy Frontend (React) on Vercel

### Step 1: Update Backend URL in Vercel

1. **Go to Vercel**: https://vercel.com
2. **Import your GitHub repository**: johnny-ops/meet-me
3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add: `VITE_SERVER_URL` = `https://your-backend-url.onrender.com` (from Part 1)
   - Make sure to use the backend URL you got from Render/Railway/Heroku

5. **Click "Deploy"**

### Step 2: Update CORS on Backend

After deploying to Vercel, you need to update the backend to allow your Vercel domain.

Update `server/server.js`:

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://your-vercel-app.vercel.app',  // Add your Vercel URL
      'https://meet-me-ten.vercel.app'       // Your actual Vercel URL
    ],
    methods: ['GET', 'POST']
  }
})
```

Then commit and push:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

The backend will automatically redeploy on Render/Railway.

---

## Part 3: Configure Vercel Settings (Fix 404 Error)

The "404 Not Found" error happens because Vercel doesn't know how to handle React Router.

### Option 1: Using vercel.json (Already Created)

The `vercel.json` file has been created in your project root. Make sure it's committed:

```bash
git add vercel.json
git commit -m "Add Vercel configuration"
git push
```

Then in Vercel:
1. Go to your project settings
2. Click "Redeploy" to apply the new configuration

### Option 2: Manual Configuration in Vercel Dashboard

1. Go to your Vercel project
2. Click "Settings" → "General"
3. Scroll to "Build & Development Settings"
4. Set:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Go to "Settings" → "Rewrites"
6. Add a rewrite rule:
   - **Source**: `/(.*)`
   - **Destination**: `/index.html`

---

## Complete Deployment Checklist

- [ ] Backend deployed on Render/Railway/Heroku
- [ ] Backend URL copied
- [ ] Frontend deployed on Vercel
- [ ] Environment variable `VITE_SERVER_URL` set in Vercel
- [ ] CORS updated in backend with Vercel URL
- [ ] vercel.json committed and pushed
- [ ] Vercel redeployed with new configuration
- [ ] Test the application

---

## Testing Your Deployment

1. **Open your Vercel URL**: https://your-app.vercel.app
2. **Check browser console** (F12) for any errors
3. **Create a meeting** and test if it works
4. **Open in another browser/incognito** and join the same room
5. **Test all features**:
   - Video/Audio
   - Chat
   - Screen sharing
   - Recording

---

## Troubleshooting

### Issue: "404 Not Found" on Vercel

**Solution**:
- Make sure `vercel.json` is in the root directory
- Redeploy the project
- Check that Root Directory is set to `client`

### Issue: "Cannot connect to server"

**Solution**:
- Check if backend is running (visit backend URL in browser)
- Verify `VITE_SERVER_URL` environment variable in Vercel
- Check CORS settings in backend
- Make sure backend URL uses `https://` not `http://`

### Issue: "WebSocket connection failed"

**Solution**:
- Ensure backend supports WebSocket (Render/Railway do, Vercel doesn't)
- Check if backend is using correct port
- Verify Socket.io CORS configuration

### Issue: "Screen sharing not working"

**Solution**:
- Screen sharing requires HTTPS (Vercel provides this automatically)
- Check browser permissions
- Some browsers block screen sharing on certain domains

---

## Environment Variables Summary

### Vercel (Frontend)
```
VITE_SERVER_URL=https://your-backend.onrender.com
```

### Render/Railway (Backend)
```
PORT=4000
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
```

---

## Cost Breakdown

### Free Tier Options:
- **Vercel**: Free (Hobby plan)
- **Render**: Free (with limitations - sleeps after 15 min of inactivity)
- **Railway**: $5 credit/month free

### Paid Options (for production):
- **Render**: $7/month (always on)
- **Railway**: Pay as you go
- **Heroku**: $7/month (Eco Dynos)

---

## Alternative: Deploy Everything on Railway

If you want to deploy both frontend and backend on the same platform:

1. **Deploy Backend** (as described above)
2. **Deploy Frontend** as a separate service
3. **Configure environment variables** for both
4. Railway will give you separate URLs for each service

---

## Important Notes

1. **HTTPS Required**: WebRTC requires HTTPS in production (both Vercel and Render provide this)
2. **TURN Server**: For production, consider adding a TURN server for better connectivity
3. **Scaling**: Current mesh topology works for 2-6 users. For more users, implement SFU
4. **Monitoring**: Set up error tracking (Sentry) and analytics
5. **Free Tier Limitations**: Render free tier sleeps after 15 minutes of inactivity (30-60 second cold start)

---

## Quick Deploy Commands

```bash
# Commit vercel.json and environment files
git add vercel.json client/.env.production client/.env.example DEPLOYMENT_GUIDE.md
git commit -m "Add deployment configuration"
git push

# Then deploy on Vercel and Render through their web interfaces
```

---

## Need Help?

- Vercel Documentation: https://vercel.com/docs
- Render Documentation: https://render.com/docs
- Railway Documentation: https://docs.railway.app
- Socket.io Documentation: https://socket.io/docs/v4/

