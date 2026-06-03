package handlers

import (
	"database/sql"
	"log"
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
		log.Printf("GetAll events error: %v", err)
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

func (h *EventHandler) GetMyEvents(c *gin.Context) {
	organizerID := c.GetInt("user_id")
	events, err := h.events.GetByOrganizer(organizerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}
	if events == nil {
		events = []models.Event{}
	}
	c.JSON(http.StatusOK, events)
}

func (h *EventHandler) Create(c *gin.Context) {
	organizerID := c.GetInt("user_id")
	var req models.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	event, err := h.events.Create(&req, organizerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, event)
}

func (h *EventHandler) Delete(c *gin.Context) {
	organizerID := c.GetInt("user_id")
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "некорректный id"})
		return
	}

	if err := h.events.Delete(id, organizerID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "удалено"})
}

func (h *EventHandler) GetVenues(c *gin.Context) {
	venues, err := h.events.GetVenues()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}
	if venues == nil {
		venues = []models.Venue{}
	}
	c.JSON(http.StatusOK, venues)
}

func (h *EventHandler) GetSeatTypes(c *gin.Context) {
	venueID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "некорректный id"})
		return
	}
	types, err := h.events.GetSeatTypes(venueID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}
	if types == nil {
		types = []string{}
	}
	c.JSON(http.StatusOK, types)
}

func (h *EventHandler) CreateVenue(c *gin.Context) {
	var req models.CreateVenueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	venue, err := h.events.CreateVenue(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, venue)
}

func (h *EventHandler) DeleteVenue(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "некорректный id"})
		return
	}
	if err := h.events.DeleteVenue(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "удалено"})
}
