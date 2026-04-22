package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Health(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status": "error",
				"db":     "disconnected",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"db":     "connected",
		})
	}
}
