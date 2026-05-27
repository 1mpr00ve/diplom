package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"tickets/db"
	"tickets/handlers"
	"tickets/middleware"
	"tickets/repository"
)

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func main() {
	database, err := db.Connect()
	if err != nil {
		log.Fatalf("Ошибка подключения к БД: %v", err)
	}
	defer database.Close()

	userRepo := repository.NewUserRepository(database)
	eventRepo := repository.NewEventRepository(database)
	orderRepo := repository.NewOrderRepository(database)

	authHandler := handlers.NewAuthHandler(userRepo)
	eventHandler := handlers.NewEventHandler(eventRepo)
	orderHandler := handlers.NewOrderHandler(orderRepo)
	userHandler := handlers.NewUserHandler(userRepo, orderRepo)

	r := gin.Default()
	r.Use(corsMiddleware())

	api := r.Group("/api")
	{
		api.GET("/health", handlers.Health(database))
		api.GET("/venues", eventHandler.GetVenues)
		api.GET("/venues/:id/seat-types", eventHandler.GetSeatTypes)

		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		events := api.Group("/events")
		{
			events.GET("", eventHandler.GetAll)
			events.GET("/:id", eventHandler.GetByID)
		}

		// Защищённые маршруты
		protected := api.Group("")
		protected.Use(middleware.Auth())
		{
			// Общие
			protected.GET("/me", userHandler.GetMe)
			protected.GET("/me/orders", userHandler.GetMyOrders)

			// Заказы
			orders := protected.Group("/orders")
			{
				orders.POST("/reserve", orderHandler.Reserve)
				orders.POST("/:id/pay", orderHandler.Pay)
				orders.GET("/:id", orderHandler.GetByID)
			}

			// Только для организаторов
			org := protected.Group("")
			org.Use(middleware.RequireRole("organizer"))
			{
				org.GET("/me/events", eventHandler.GetMyEvents)
				org.POST("/events", eventHandler.Create)
				org.DELETE("/events/:id", eventHandler.Delete)
			}

			// Только для администраторов
			admin := protected.Group("/admin")
			admin.Use(middleware.RequireRole("admin"))
			{
				admin.POST("/venues", eventHandler.CreateVenue)
				admin.DELETE("/venues/:id", eventHandler.DeleteVenue)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Backend запущен на порту %s", port)
	r.Run(":" + port)
}
