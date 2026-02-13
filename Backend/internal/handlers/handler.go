package handlers

import (
	"fanzone/internal/config"
	"fanzone/internal/repository"
	"fanzone/pkg/worker"
)

type Handler struct {
	Repo   *repository.Repository
	Config *config.Config
	Worker *worker.Worker
}

func NewHandler(repo *repository.Repository, cfg *config.Config, worker *worker.Worker) *Handler {
	return &Handler{
		Repo:   repo,
		Config: cfg,
		Worker: worker,
	}
}
