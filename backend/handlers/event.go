package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"tickets/models"
	"tickets/repository"
)

type EventHandler struct {
	events *repository.EventRepository
}

func NewEventHandler(events *repository.EventRepository) *EventHandler {
	return &EventHandler{events: events}
}

func (h *EventHandler) GetAll(c *gin.Context) {
	events, err := h.events.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}
	if events == nil {
		events = []models.Event{}
	}
	c.JSON(http.StatusOK, events)
}

func (h *EventHandler) GetByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "некорректный id"})
		return
	}

	event, err := h.events.GetByID(id)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "событие не найдено"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}

	c.JSON(http.StatusOK, event)
}
