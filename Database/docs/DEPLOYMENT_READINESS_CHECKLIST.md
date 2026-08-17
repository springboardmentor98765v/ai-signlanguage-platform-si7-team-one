# Deployment Readiness Checklist

## AI Sign Language Learning & Assessment Platform

**Purpose:** Milestone 4 production deployment  
**Prepared during:** Milestone 3 — Day 9  
**Status:** Planning document — NO LIVE DEPLOYMENT PERFORMED IN MILESTONE 3

---

## 1. Pre-Deployment Verification

- [ ] Milestone 3 local integration tests completed successfully
- [ ] Docker Compose starts the complete local stack
- [ ] Backend service verified locally
- [ ] AI service verified locally
- [ ] Business Logic service verified locally
- [ ] Frontend verified locally
- [ ] Database verified locally
- [ ] Data integrity checks completed with no critical issues
- [ ] OWASP ZAP security scan completed
- [ ] No critical security findings remain
- [ ] Final regression tests completed before deployment

---

## 2. Production Hosting Plan

### Database

- [ ] Select final production PostgreSQL hosting provider
- [ ] Create production PostgreSQL database
- [ ] Create production database user
- [ ] Configure strong production database password
- [ ] Confirm database connectivity from backend
- [ ] Confirm database connectivity from Business Logic service
- [ ] Configure production backup strategy

### Backend API

- [ ] Select final backend hosting provider
- [ ] Deploy FastAPI backend
- [ ] Configure production DATABASE_URL
- [ ] Configure production SECRET_KEY
- [ ] Configure ALGORITHM
- [ ] Configure ACCESS_TOKEN_EXPIRE_MINUTES
- [ ] Confirm backend health endpoint
- [ ] Confirm backend can connect to production database

### AI Service

- [ ] Select final AI-service hosting provider
- [ ] Deploy AI service
- [ ] Verify model files are available
- [ ] Verify required Python dependencies are installed
- [ ] Confirm AI prediction endpoint is reachable
- [ ] Test prediction against validated local model
- [ ] Confirm production AI results match validated local results

### Business Logic Service

- [ ] Deploy Business Logic service if hosted separately
- [ ] Configure production AI_SERVICE_URL
- [ ] Configure production BACKEND_API_URL
- [ ] Configure production DATABASE_URL
- [ ] Set USE_MOCK_AI=false
- [ ] Configure AI_SERVICE_TIMEOUT_SECONDS
- [ ] Verify communication with backend, AI service and database

### Frontend

- [ ] Select final frontend hosting provider
- [ ] Build frontend using production API URLs
- [ ] Configure production VITE_API_URL
- [ ] Configure production VITE_AI_API_URL
- [ ] Configure production VITE_BUSINESS_API_URL
- [ ] Verify frontend can communicate with backend
- [ ] Verify authentication and protected routes
- [ ] Verify complete learner workflow

---

## 3. Secrets and Environment Variables

- [ ] No production passwords committed to Git
- [ ] No production SECRET_KEY committed to Git
- [ ] Production environment variables configured through hosting platform
- [ ] Database credentials stored securely
- [ ] SECRET_KEY generated as a strong random value
- [ ] Local development `.env` remains excluded from Git
- [ ] Production configuration is separate from local configuration

---

## 4. Database Deployment

- [ ] Take final local database backup
- [ ] Verify backup file is valid
- [ ] Create production database
- [ ] Apply schema.sql
- [ ] Apply seed.sql where appropriate
- [ ] Verify all required tables exist
- [ ] Verify indexes exist
- [ ] Verify foreign keys and constraints
- [ ] Run data integrity checks
- [ ] Test backup and restore procedure

---

## 5. Application Integration Testing

- [ ] Register user
- [ ] Login
- [ ] View lessons
- [ ] Start practice session
- [ ] Send image/frame to AI service
- [ ] Receive AI prediction and confidence
- [ ] Generate assessment score
- [ ] Generate feedback
- [ ] Verify badges
- [ ] Verify streaks
- [ ] Verify leaderboard
- [ ] Verify notifications
- [ ] Verify recommendations
- [ ] Verify certification exam
- [ ] Verify certificate generation
- [ ] Verify reports
- [ ] Verify Accessibility Trainer workflow
- [ ] Verify Admin workflow

---

## 6. Security Verification

- [ ] Run security scan against production environment
- [ ] Review critical/high findings
- [ ] Fix critical security issues
- [ ] Verify HTTPS
- [ ] Verify secure production secrets
- [ ] Verify authentication
- [ ] Verify authorization and role restrictions
- [ ] Verify rate limiting
- [ ] Verify security headers where applicable

---

## 7. Monitoring and Reliability

- [ ] Configure free uptime monitoring
- [ ] Configure basic application logging
- [ ] Verify backend health monitoring
- [ ] Verify AI service availability
- [ ] Verify frontend availability
- [ ] Test service restart/recovery
- [ ] Document free-tier limitations such as sleep/cold starts

---

## 8. Final Deployment Acceptance

- [ ] Frontend reachable from the internet
- [ ] Backend reachable from the frontend
- [ ] AI service reachable by the required services
- [ ] Database reachable by backend/business services
- [ ] Complete end-to-end workflow tested
- [ ] Production AI results compared with validated local results
- [ ] All major dashboards verified
- [ ] All five report types verified
- [ ] Monitoring active
- [ ] Final bugs fixed
- [ ] Deployment/handover guide prepared

---

## 9. Milestone 4 Deployment Order

1. [ ] Production PostgreSQL database
2. [ ] Backend API
3. [ ] AI service
4. [ ] Business Logic service
5. [ ] Frontend
6. [ ] Environment variables and secrets
7. [ ] Service-to-service connectivity
8. [ ] Monitoring
9. [ ] Full smoke test
10. [ ] Final team acceptance

---

## 10. Important Milestone Boundary

This document was prepared during **Milestone 3 Day 9**.

**No live/public deployment is performed as part of this Milestone 3 task.**

Actual deployment begins in **Milestone 4** according to the Milestone 4 deployment plan.

---

## 11. Team Review

- [ ] Intern 1 reviewed
- [ ] Intern 2 reviewed
- [ ] Intern 3 reviewed
- [ ] Intern 4 reviewed
- [ ] Intern 5 reviewed
- [ ] Mentor/Team Lead reviewed

**Document status:** Ready for Milestone 4 use.