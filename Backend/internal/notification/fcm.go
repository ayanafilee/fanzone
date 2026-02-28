package notification

import (
	"context"
	"log"
	"path/filepath"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

type FCMService struct {
	client *messaging.Client
}

func NewFCMService() (*FCMService, error) {
	// Path to Firebase service account key
	serviceAccountPath := filepath.Join("internal", "config", "fanzone-c7f93-firebase-adminsdk-fbsvc-7fa1955ab1.json")

	opt := option.WithCredentialsFile(serviceAccountPath)
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Printf("Error initializing Firebase app: %v", err)
		return nil, err
	}

	client, err := app.Messaging(context.Background())
	if err != nil {
		log.Printf("Error getting Messaging client: %v", err)
		return nil, err
	}

	log.Println("Firebase Cloud Messaging initialized successfully")
	return &FCMService{client: client}, nil
}

// SendToTopic sends a notification to all users subscribed to a topic
func (f *FCMService) SendToTopic(topic, title, body string, data map[string]string) error {
	message := &messaging.Message{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Data:  data,
		Topic: topic,
	}

	response, err := f.client.Send(context.Background(), message)
	if err != nil {
		log.Printf("Error sending FCM message to topic %s: %v", topic, err)
		return err
	}

	log.Printf("Successfully sent message to topic %s: %s", topic, response)
	return nil
}

// SendToDevice sends a notification to a specific device token
func (f *FCMService) SendToDevice(token, title, body string, data map[string]string) error {
	message := &messaging.Message{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Data:  data,
		Token: token,
	}

	response, err := f.client.Send(context.Background(), message)
	if err != nil {
		log.Printf("Error sending FCM message to device: %v", err)
		return err
	}

	log.Printf("Successfully sent message to device: %s", response)
	return nil
}

// SendToMultipleDevices sends a notification to multiple device tokens
func (f *FCMService) SendToMultipleDevices(tokens []string, title, body string, data map[string]string) error {
	message := &messaging.MulticastMessage{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Data:   data,
		Tokens: tokens,
	}

	response, err := f.client.SendMulticast(context.Background(), message)
	if err != nil {
		log.Printf("Error sending FCM multicast message: %v", err)
		return err
	}

	log.Printf("Successfully sent %d messages, %d failures", response.SuccessCount, response.FailureCount)
	return nil
}

// NotifyNewContent sends notification when new content is created
func (f *FCMService) NotifyNewContent(clubID, clubName, title, contentID, contentType string) error {
	// Send to club-specific topic
	topic := "club_" + clubID
	notificationTitle := "New " + contentType + " from " + clubName
	notificationBody := title

	data := map[string]string{
		"type":       contentType,
		"content_id": contentID,
		"club_id":    clubID,
		"club_name":  clubName,
	}

	return f.SendToTopic(topic, notificationTitle, notificationBody, data)
}

// NotifyNewHighlight sends notification when new highlight is created
func (f *FCMService) NotifyNewHighlight(clubIDs []string, clubNames []string, matchTitle, highlightID string) error {
	// Send to each club's topic
	for i, clubID := range clubIDs {
		topic := "club_" + clubID
		clubName := "Unknown Club"
		if i < len(clubNames) {
			clubName = clubNames[i]
		}

		notificationTitle := "New Match Highlight"
		notificationBody := matchTitle

		data := map[string]string{
			"type":         "highlight",
			"highlight_id": highlightID,
			"club_id":      clubID,
			"club_name":    clubName,
			"match_title":  matchTitle,
		}

		err := f.SendToTopic(topic, notificationTitle, notificationBody, data)
		if err != nil {
			log.Printf("Failed to send notification to club %s: %v", clubID, err)
		}
	}

	return nil
}

// NotifyAllUsers sends notification to all users (general topic)
func (f *FCMService) NotifyAllUsers(title, body string, data map[string]string) error {
	return f.SendToTopic("all_users", title, body, data)
}
