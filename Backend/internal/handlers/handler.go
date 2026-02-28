package handlers

import (
	"fanzone/internal/config"
	"fanzone/internal/notification"
	"fanzone/internal/repository"
	"fanzone/pkg/worker"
)

type Handler struct {
	Repo   *repository.Repository
	Config *config.Config
	Worker *worker.Worker
	FCM    *notification.FCMService
}

func NewHandler(repo *repository.Repository, cfg *config.Config, worker *worker.Worker, fcm *notification.FCMService) *Handler {
	return &Handler{
		Repo:   repo,
		Config: cfg,
		Worker: worker,
		FCM:    fcm,
	}
}
