package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"tickets/db"
	"tickets/handlers"
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

	authHandler := handlers.NewAuthHandler(userRepo)
	eventHandler := handlers.NewEventHandler(eventRepo)

	r := gin.Default()
	r.Use(corsMiddleware())

	api := r.Group("/api")
	{
		api.GET("/health", handlers.Health(database))

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
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Backend запущен на порту %s", port)
	r.Run(":" + port)
}
