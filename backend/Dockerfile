FROM golang:1.22-alpine

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY . .
RUN go mod tidy && go build -o main .

EXPOSE 8080

CMD ["./main"]
