package handlers

import (
	"net/http"
	"tickets/repository"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	users  *repository.UserRepository
	orders *repository.OrderRepository
}

func NewUserHandler(users *repository.UserRepository, orders *repository.OrderRepository) *UserHandler {
	return &UserHandler{users: users, orders: orders}
}

func (h *UserHandler) GetMe(c *gin.Context) {
	userID := c.GetInt("user_id")
	user, err := h.users.GetByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "пользователь не найден"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) GetMyOrders(c *gin.Context) {
	userID := c.GetInt("user_id")
	orders, err := h.orders.GetUserOrders(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ошибка сервера"})
		return
	}
	c.JSON(http.StatusOK, orders)
}
