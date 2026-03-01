package notification

import (
	"context"
	"log"
	"os"
	"path/filepath"
	"regexp"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

type FCMService struct {
	client *messaging.Client
}

func NewFCMService() (*FCMService, error) {
	log.Printf("🔧 [FCM INIT] Attempting to initialize Firebase")

	var opt option.ClientOption
	
	// Try to get credentials from environment variable first (JSON string)
	firebaseCredentials := os.Getenv("FIREBASE_CREDENTIALS")
	if firebaseCredentials != "" {
		log.Printf("🔧 [FCM INIT] Using Firebase credentials from FIREBASE_CREDENTIALS environment variable (length: %d bytes)", len(firebaseCredentials))
		opt = option.WithCredentialsJSON([]byte(firebaseCredentials))
	} else {
		// Try to get file path from environment variable (Render Secret Files)
		firebaseConfigPath := os.Getenv("FIREBASE_CONFIG_PATH")
		if firebaseConfigPath != "" {
			log.Printf("🔧 [FCM INIT] Using Firebase credentials from secret file: %s", firebaseConfigPath)
			opt = option.WithCredentialsFile(firebaseConfigPath)
		} else {
			// Fallback to local file for development
			serviceAccountPath := filepath.Join("internal", "config", "fanzone-c7f93-firebase-adminsdk-fbsvc-7fa1955ab1.json")
			log.Printf("🔧 [FCM INIT] Using local Firebase credentials file: %s", serviceAccountPath)
			opt = option.WithCredentialsFile(serviceAccountPath)
		}
	}

	// Configure Firebase with project ID
	config := &firebase.Config{
		ProjectID: "fanzone-c7f93",
	}

	app, err := firebase.NewApp(context.Background(), config, opt)
	if err != nil {
		log.Printf("❌ [FCM INIT ERROR] Failed to initialize Firebase app: %v", err)
		return nil, err
	}
	log.Println("✅ [FCM INIT] Firebase app initialized successfully")

	client, err := app.Messaging(context.Background())
	if err != nil {
		log.Printf("❌ [FCM INIT ERROR] Failed to get Messaging client: %v", err)
		return nil, err
	}

	log.Println("✅ [FCM INIT] Firebase Cloud Messaging initialized successfully")
	return &FCMService{client: client}, nil
}

// SendToTopic sends a notification to all users subscribed to a topic
func (f *FCMService) SendToTopic(topic, title, body string, data map[string]string) error {
	log.Printf("📤 [FCM SEND] Preparing to send notification to topic: %s", topic)
	log.Printf("📝 [FCM SEND] Title: %s", title)
	log.Printf("📝 [FCM SEND] Body: %s", body)
	log.Printf("📝 [FCM SEND] Data: %+v", data)
	
	// Build message with Android-specific configuration for rich notifications
	message := &messaging.Message{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Data:  data,
		Topic: topic,
	}

	// Determine notification type and add appropriate actions
	notificationType := data["type"]
	
	// Add image and actions to Android notification if image_url is provided
	if imageURL, ok := data["image_url"]; ok && imageURL != "" {
		log.Printf("🖼️  [FCM SEND] Adding image to notification: %s", imageURL)
		
		// Configure Android-specific notification with actions
		androidConfig := &messaging.AndroidConfig{
			Notification: &messaging.AndroidNotification{
				ImageURL: imageURL,
				ClickAction: "FLUTTER_NOTIFICATION_CLICK",
			},
		}
		
		// Add action buttons based on notification type
		if notificationType == "highlight" {
			log.Printf("🎬 [FCM SEND] Adding 'Watch' and 'Dismiss' actions for highlight")
			// For highlights: Watch (left) and Dismiss (right)
			data["action_left"] = "watch"
			data["action_left_label"] = "Watch"
			data["action_right"] = "dismiss"
			data["action_right_label"] = "Dismiss"
		} else if notificationType == "news" {
			log.Printf("📰 [FCM SEND] Adding 'Read' and 'Dismiss' actions for news")
			// For news: Read (left) and Dismiss (right)
			data["action_left"] = "read"
			data["action_left_label"] = "Read"
			data["action_right"] = "dismiss"
			data["action_right_label"] = "Dismiss"
		}
		
		message.Android = androidConfig
	}

	log.Printf("🚀 [FCM SEND] Sending message to Firebase...")
	response, err := f.client.Send(context.Background(), message)
	if err != nil {
		log.Printf("❌ [FCM ERROR] Failed to send message to topic %s: %v", topic, err)
		return err
	}

	log.Printf("✅ [FCM SUCCESS] Message sent successfully to topic %s", topic)
	log.Printf("📬 [FCM RESPONSE] Firebase response: %s", response)
	return nil
}

// SendToDevice sends a notification to a specific device token
func (f *FCMService) SendToDevice(token, title, body string, data map[string]string) error {
	log.Printf("📤 [FCM DEVICE] Preparing to send notification to device")
	log.Printf("🔑 [FCM DEVICE] Token: %s", token)
	log.Printf("📝 [FCM DEVICE] Title: %s", title)
	log.Printf("📝 [FCM DEVICE] Body: %s", body)
	log.Printf("📝 [FCM DEVICE] Data: %+v", data)
	
	message := &messaging.Message{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Data:  data,
		Token: token,
	}

	log.Printf("🚀 [FCM DEVICE] Sending message to Firebase...")
	response, err := f.client.Send(context.Background(), message)
	if err != nil {
		log.Printf("❌ [FCM DEVICE ERROR] Failed to send message: %v", err)
		return err
	}

	log.Printf("✅ [FCM DEVICE SUCCESS] Message sent successfully")
	log.Printf("📬 [FCM DEVICE RESPONSE] Firebase response: %s", response)
	return nil
}

// SendToMultipleDevices sends a notification to multiple device tokens
func (f *FCMService) SendToMultipleDevices(tokens []string, title, body string, data map[string]string) error {
	log.Printf("📤 [FCM MULTICAST] Preparing to send notification to %d devices", len(tokens))
	log.Printf("📝 [FCM MULTICAST] Title: %s", title)
	log.Printf("📝 [FCM MULTICAST] Body: %s", body)
	log.Printf("📝 [FCM MULTICAST] Data: %+v", data)
	log.Printf("🔑 [FCM MULTICAST] Tokens: %v", tokens)
	
	message := &messaging.MulticastMessage{
		Notification: &messaging.Notification{
			Title: title,
			Body:  body,
		},
		Data:   data,
		Tokens: tokens,
	}

	log.Printf("🚀 [FCM MULTICAST] Sending messages to Firebase...")
	response, err := f.client.SendMulticast(context.Background(), message)
	if err != nil {
		log.Printf("❌ [FCM MULTICAST ERROR] Failed to send messages: %v", err)
		return err
	}

	log.Printf("✅ [FCM MULTICAST SUCCESS] Sent %d messages successfully", response.SuccessCount)
	log.Printf("⚠️  [FCM MULTICAST] %d failures", response.FailureCount)
	
	// Log individual failures
	if response.FailureCount > 0 {
		for i, resp := range response.Responses {
			if !resp.Success {
				log.Printf("❌ [FCM MULTICAST FAILURE] Token %d failed: %v", i, resp.Error)
			}
		}
	}
	
	return nil
}

// NotifyNewContent sends notification when new content is created
func (f *FCMService) NotifyNewContent(clubID, clubName, title, contentID, contentType, imageURL string) error {
	log.Printf("🔔 [NOTIFY CONTENT] New content notification triggered")
	log.Printf("🏟️  [NOTIFY CONTENT] Club: %s (ID: %s)", clubName, clubID)
	log.Printf("📰 [NOTIFY CONTENT] Type: %s", contentType)
	log.Printf("📝 [NOTIFY CONTENT] Title: %s", title)
	log.Printf("🆔 [NOTIFY CONTENT] Content ID: %s", contentID)
	log.Printf("🖼️  [NOTIFY CONTENT] Image URL: %s", imageURL)
	
	// Send to club-specific topic
	topic := "club_" + clubID
	notificationTitle := "New " + contentType + " from " + clubName
	notificationBody := title

	data := map[string]string{
		"type":       contentType,
		"content_id": contentID,
		"club_id":    clubID,
		"club_name":  clubName,
		"title":      title,
		"image_url":  imageURL,
	}

	log.Printf("📡 [NOTIFY CONTENT] Sending to topic: %s", topic)
	return f.SendToTopic(topic, notificationTitle, notificationBody, data)
}

// NotifyNewHighlight sends notification when new highlight is created
func (f *FCMService) NotifyNewHighlight(clubIDs []string, clubNames []string, matchTitle, highlightID, videoURL string) error {
	log.Printf("🔔 [NOTIFY HIGHLIGHT] New highlight notification triggered")
	log.Printf("🎥 [NOTIFY HIGHLIGHT] Match: %s", matchTitle)
	log.Printf("🆔 [NOTIFY HIGHLIGHT] Highlight ID: %s", highlightID)
	log.Printf("🎬 [NOTIFY HIGHLIGHT] Video URL: %s", videoURL)
	log.Printf("🏟️  [NOTIFY HIGHLIGHT] Clubs involved: %d", len(clubIDs))
	
	// Generate YouTube thumbnail URL
	thumbnailURL := getYouTubeThumbnail(videoURL)
	if thumbnailURL != "" {
		log.Printf("🖼️  [NOTIFY HIGHLIGHT] Generated thumbnail: %s", thumbnailURL)
	} else {
		log.Printf("⚠️  [NOTIFY HIGHLIGHT] Could not generate thumbnail from video URL")
	}
	
	// Send to each club's topic
	for i, clubID := range clubIDs {
		topic := "club_" + clubID
		clubName := "Unknown Club"
		if i < len(clubNames) {
			clubName = clubNames[i]
		}

		log.Printf("📡 [NOTIFY HIGHLIGHT] Sending to club %d: %s (ID: %s)", i+1, clubName, clubID)
		log.Printf("📡 [NOTIFY HIGHLIGHT] Topic: %s", topic)

		notificationTitle := "New Match Highlight"
		notificationBody := matchTitle

		data := map[string]string{
			"type":         "highlight",
			"highlight_id": highlightID,
			"club_id":      clubID,
			"club_name":    clubName,
			"match_title":  matchTitle,
			"video_url":    videoURL,
			"image_url":    thumbnailURL,
		}

		err := f.SendToTopic(topic, notificationTitle, notificationBody, data)
		if err != nil {
			log.Printf("❌ [NOTIFY HIGHLIGHT ERROR] Failed to send notification to club %s: %v", clubID, err)
		} else {
			log.Printf("✅ [NOTIFY HIGHLIGHT] Successfully sent to club %s", clubName)
		}
	}

	log.Printf("✅ [NOTIFY HIGHLIGHT] Completed sending to all %d clubs", len(clubIDs))
	return nil
}

// NotifyAllUsers sends notification to all users (general topic)
func (f *FCMService) NotifyAllUsers(title, body string, data map[string]string) error {
	log.Printf("🔔 [NOTIFY ALL] Broadcasting notification to all users")
	log.Printf("📝 [NOTIFY ALL] Title: %s", title)
	log.Printf("📝 [NOTIFY ALL] Body: %s", body)
	log.Printf("📝 [NOTIFY ALL] Data: %+v", data)
	log.Printf("📡 [NOTIFY ALL] Topic: all_users")
	
	return f.SendToTopic("all_users", title, body, data)
}

// extractYouTubeID extracts video ID from various YouTube URL formats
func extractYouTubeID(url string) string {
	patterns := []string{
		`(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)`,
		`youtube\.com\/embed\/([^&\n?#]+)`,
		`youtube\.com\/v\/([^&\n?#]+)`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(url)
		if len(matches) > 1 {
			return matches[1]
		}
	}
	return ""
}

// getYouTubeThumbnail generates YouTube thumbnail URL from video URL
func getYouTubeThumbnail(videoURL string) string {
	videoID := extractYouTubeID(videoURL)
	if videoID == "" {
		return ""
	}
	// Use maxresdefault for highest quality (1280x720)
	return "https://img.youtube.com/vi/" + videoID + "/maxresdefault.jpg"
}
