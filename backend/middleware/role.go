package middleware

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists || userRole != role {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "нет доступа"})
			return
		}
		c.Next()
	}
}
