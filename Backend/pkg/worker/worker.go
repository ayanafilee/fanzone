package worker

import (
	"fmt"
	"log"
	"time"
)

// Task represents a unit of work
type Task struct {
	Type    string
	Payload interface{}
}

// Worker handles background tasks
type Worker struct {
	TaskQueue chan Task
	Quit      chan bool
}

func NewWorker(bufferSize int) *Worker {
	return &Worker{
		TaskQueue: make(chan Task, bufferSize),
		Quit:      make(chan bool),
	}
}

func (w *Worker) Start(numWorkers int) {
	for i := 0; i < numWorkers; i++ {
		go func(workerID int) {
			fmt.Printf("Worker %d started\n", workerID)
			for {
				select {
				case task := <-w.TaskQueue:
					fmt.Printf("Worker %d processing task: %v\n", workerID, task.Type)
					processTask(task)
				case <-w.Quit:
					fmt.Printf("Worker %d stopping\n", workerID)
					return
				}
			}
		}(i)
	}
}

func (w *Worker) Stop() {
	go func() {
		w.Quit <- true
	}()
}

func (w *Worker) AddTask(t Task) {
	// Non-blocking send (optional, or blocking if valid)
	// For now, let's block to ensure it's queued
	w.TaskQueue <- t
}

func processTask(t Task) {
	// Simulate work
	time.Sleep(2 * time.Second)
	switch t.Type {
	case "SEND_EMAIL":
		email := t.Payload.(string)
		log.Printf("[Email Service] Sending welcome email to %s\n", email)
	case "LOG_ACTIVITY":
		msg := t.Payload.(string)
		log.Printf("[Activity Log] %s\n", msg)
	default:
		log.Printf("Unknown task type: %s", t.Type)
	}
}
