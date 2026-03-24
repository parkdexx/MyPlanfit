# MyPlanfit

MyPlanfit is a goal-oriented workout management application designed to help users create custom workout routines and track their progress effectively.

> [!NOTE]
> **Disclaimer:** This project is a personal toy project created for testing and learning purposes, mimicking the original service [Planfit](https://planfit.ai/ko).
> 
> **원본 서비스 안내:** 본 프로젝트는 운동 루틴 관리 서비스인 [Planfit](https://planfit.ai/ko)을 모방하여 테스트 및 학습용으로 제작된 개인 토이 프로젝트입니다.

---

## Live Demo
Check out the latest version here: [MyPlanfit Test Server](https://myplanfit-65988077346.asia-northeast3.run.app/)

---

## Core Features
- **Structured Planning:** Create multi-layered workout plans (Day > Exercise > Sets).
- **Exercise Library:** Categorized body parts with integrated YouTube video guides.
- **Smart Tracking:** Automatically carries over weight and reps from previous sets for efficient logging.
- **Progress Calendar:** Visualize consistency and view detailed historical logs by clicking on specific dates.
- **Motivational Feedback:** Real-time progress tracking and completion rewards.

## Technical Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **Database:** MySQL (Google Cloud SQL)
- **Infrastructure:** Google Cloud Platform (Cloud Run)
- **Security:** JWT Authentication, Rate Limiting, CORS, and Helmet integration.

## Project Structure
- `src/client`: React frontend application.
- `src/server`: Node.js Express backend API.

## Architecture Highlights
- **Hierarchical Data Model:** `Plan` → `Day` → `Exercise` → `Set`
- **Security First:** Implemented request validation and rate limiting to ensure stable cloud deployment.
- **Automation:** Includes scripts for exercise video link validation and management.

<br/>

Original service: https://planfit.ai/ko

Original service: https://planfit.ai/ko

Original service: https://planfit.ai/ko