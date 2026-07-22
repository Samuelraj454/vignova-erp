# Final Deployment Checklist

The codebase has been pushed successfully to `https://github.com/Samuelraj454/vignova-erp.git`.

Follow this checklist to complete the cloud deployments.

## 1. Render Deployment (Backend)
Render hosts the FastAPI application using the `render.yaml` configuration in the repository.

### Steps:
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Select your repository: `Samuelraj454/vignova-erp`.
4. Render will automatically detect the settings from `render.yaml`.
5. You must supply the following exact environment variables in the Render Dashboard when prompted:

### Render Environment Variables:
```text
PYTHON_VERSION
3.12.0

DATABASE_URL
postgresql+asyncpg://neondb_owner:npg_Lz7GnRcXePV2@ep-hidden-mountain-aw94tlqa-pooler.c-12.us-east-1.aws.neon.tech/neondb?ssl=require

CLOUDINARY_CLOUD_NAME
rtpglaxa

CLOUDINARY_API_KEY
423473312396364

CLOUDINARY_API_SECRET
xYvTt3an5bTdngh5YurLLUoLTdw

SECRET_KEY
(Generate a random secure string, e.g., 09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7)

FRONTEND_URL
https://your-vercel-domain.vercel.app (You will retrieve this in Step 2)
```

## 2. Vercel Deployment (Frontend)
Vercel hosts the React/Vite application.

### Steps:
1. Go to your [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import `Samuelraj454/vignova-erp`.
4. Expand the **Environment Variables** section and inject the following:

### Vercel Environment Variables:
```text
VITE_API_URL
https://vignova-backend-xxx.onrender.com (Copy this exact URL from your Render dashboard after Step 1 is complete)
```
5. Click **Deploy**.

## 3. Final CORS Verification
Once Vercel finishes deploying, copy your live Vercel domain (e.g., `https://vignova-erp.vercel.app`).
Go back to your Render Dashboard, navigate to the Environment tab of your backend service, and update `FRONTEND_URL` to match your Vercel URL exactly. This ensures CORS is strictly allowed for your production frontend.
