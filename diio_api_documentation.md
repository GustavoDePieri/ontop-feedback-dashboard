# API Documentation

The following documentation will help you understand and integrate with diio’s public API.

## Headers

- Authorization: (see authorization section)
- Content-Type: application/json

## Base URL

`https://{your-company-subdomain}.diio.com/api/external`

## Authorization

Authorization is done by adding a Bearer token to your headers, as follows:

- Authorization: Bearer <**access_token**>

JWT tokens are signed by diio, and have an expiration time of 1 hour, after that, you must refresh the token using the following endpoint.

## Refresh Token

In order to refresh the **access_token**, you must send a request to the following endpoint. In case that your **access_token**, is expired or invalid, the API will return a 401 response.

### **`POST** /refresh_token`

Refreshes and return a new **access_token**

### Parameters

- client_id
- client_secret
- refresh_token

## Endpoints

[Exports](https://www.notion.so/Exports-1dea27f673b1807995d6c0e8bec9f3c4?pvs=21)

[Meetings](https://www.notion.so/Meetings-264a27f673b18040af4cc9dadc45a78c?pvs=21)

[Phone Calls](https://www.notion.so/Phone-Calls-1d7a27f673b1801a907bdca88fa353b1?pvs=21)

[Transcripts](https://www.notion.so/Transcripts-264a27f673b1803f8f80d8148156027f?pvs=21)

[Users](https://www.notion.so/Users-1d7a27f673b18003bc24ce6b2c79f2f7?pvs=21)



# Exports

## Description

This API is to create Create Exports in **diio**. Data exports may be in JSON or CSV format, and you may use that consolidated file to integrate it with your processes.

## Endpoints

### `POST /v1/exports`

Creates a Phone Call to be analyzed in **diio**.

### Parameters

- `file_type` (required): The file type you would like the export in, supporter options are **csv** or **json**.
- `send_to` (optional): The email to which you would like the information to be sent.
- `model` (optional): Must be set to the model you wish to export, can take values **meeting** or **phone_call**, the default value is **meeting**.

### Response

Returns a JSON object with the following properties:

- `id`: The unique identifier of the Export.

### Example

Request:

```
POST /v1/exports
```

Request:

```json
{
	"file_type": "json",
	"send_to": "john@doe.com",
	"model": "phone_call"
}
```

Response:

```json
{
	"id": "343f605a-0bde-11f0-a454-06254876e271"
}

```

### `GET /v1/exports/:uuid`

Queries for a certain export by its uuid, and return its status and/or information.

### Parameters

- `uuid` (required): The uuid of the export generate through the create (POST) endpoint.

### Response

Returns a JSON object with the following properties:

- `id`: The unique identifier of the Export.
- `file_url`: The location from which the file must be downloaded.
- `email`: The email to which the export was sent.
- `status`: The current processing status of the export, options are **pending**, **in_progress**, **finished**, **error**.
- `created_at`: The timedate at which the export was created.

### Example 1 (Pending)

Request:

```
GET /v1/exports/343f605a-0bde-11f0-a454-06254876e271
```

Request:

Response:

```json
{
	"id": "343f605a-0bde-11f0-a454-06254876e271",
	"file_url": null,
	"email": "john@doe.com",
	"status": "pending",
	"created_at": "2025-01-01T01:01:01Z"
}
```

### Example 2 (Finished)

Request:

```
GET /v1/exports/343f605a-0bde-11f0-a454-06254876e271
```

Request:

Response:

```json
{
	"id": "343f605a-0bde-11f0-a454-06254876e271",
	"file_url": "https://example.com/343f605a-0bde-11f0-a454-06254876e271.json",
	"email": "john@doe.com",
	"status": "finished",
	"created_at": "2025-01-01T01:01:01Z"
}
```

## Errors

This API uses the following error codes:

- `400 Bad Request`: The request was malformed or missing required parameters.
- `401 Unauthorized`: The API key provided was invalid or missing. You must refresh your **access_token**.
- `404 Not Found`: The requested resource was not found.
- `500 Internal Server Error`: An unexpected error occurred on the server.



# Meetings

## Description

This API is to manage Meetings objects in **diio**.

### `GET /v1/meetings`

List a Meetings in your **diio** account.

### Parameters

- `page` (optional): The page number of the meetings.
- `limit` (optional): The limit of the amount of meetings returned in the response.

### Response

Returns a JSON object with the following properties:

- `id`: The unique identifier of the Meeting.
- `name`: The name of the Meeting.
- `scheduled_at`: The datetime at which the Meeting was scheduled.
- `created_at`: The creation datetime of the Meeting.
- `updated_at`: The datetime at which the Meeting was updated.
- `attendees`: An object with the attendees to the meeting.

### Example

Request:

```
GET /v1/meetings
```

Response:

```json
{
	"meetings": [
		{
			"id": "343f605a-0bde-11f0-a454-06254876e271",
			"name": "Meeting with John",
			"scheduled_at": "2025-10-01T15:10:05",
			"created_at": "2025-10-01T15:10:05",
			"updated_at": "2025-10-01T15:10:05",
			"last_trancript_id": "343f605a-0bde-11f0-a454-06254876e281",
			"attendees": {
				"sellers": 
					[
						{
							"name": "John Doe",
							"email": "john.doe@example.com",
							"user_id": "99a2868c-8fa3-11f0-848f-06254876e271"
						}
					],
				"customers":
					[
						{
							"name": "Customer",
							"email": "customer@client.com",
							"phone": "+13055555555"
						}
					]
				}
		},
		...
	],
	"total": 1000,
	"next": 2
}
```

## Errors

This API uses the following error codes:

- `400 Bad Request`: The request was malformed or missing required parameters.
- `401 Unauthorized`: The API key provided was invalid or missing. You must refresh your **access_token**.
- `404 Not Found`: The requested resource was not found.
- `500 Internal Server Error`: An unexpected error occurred on the server.

### `GET /v1/meetings/:id`

Show information for a specific Meeting in your **diio** account.

### Parameters

- `id` (required): The id of the meeting.

### Response

Returns a JSON object with the following properties:

- `name`: The name of the Meeting.
- `scheduled_at`: The datetime at which the Meeting occurred.
- `created_at`: The creation datetime of the Meeting.
- `updated_at`: The datetime at which the Phone Call was updated.
- `attendees`: An object with the attendees to the meeting.
- `analyzed_status`: The status of the meeting (finished, error).
- `error_cause`: The error associated with the meeting in case there’s any.

### Example

Request:

```
GET /v1/meetings/343f605a-0bde-11f0-a454-06254876e271
```

Response:

```json
{
	"id": "343f605a-0bde-11f0-a454-06254876e271"
	"name": "Meeting with John",
	"scheduled_at": "2025-10-01T15:10:05",
	"created_at": "2025-10-01T15:10:05",
	"updated_at": "2025-10-01T15:10:05",
	"last_trancript_id": "343f605a-0bde-11f0-a454-06254876e281",
	"attendees": {
		"sellers": 
			[
				{
					"name": "John Doe",
					"email": "john.doe@example.com",
					"user_id": "99a2868c-8fa3-11f0-848f-06254876e271"
				}
			],
		"customers":
			[
				{
					"name": "Customer",
					"email": "customer@client.com",
					"phone": "+13055555555"
				}
			]
		},
	"analyzed_status": "finished",
	"error_cause": null
}
```

## Errors

This API uses the following error codes:

- `400 Bad Request`: The request was malformed or missing required parameters.
- `401 Unauthorized`: The API key provided was invalid or missing. You must refresh your **access_token**.
- `404 Not Found`: The requested resource was not found.
- `500 Internal Server Error`: An unexpected error occurred on the server.


# Phone Calls

## Description

This API is to manage Phone Call objects in **diio**.

## Endpoints

### `POST /v1/phone_calls`

Creates a Phone Call to be analyzed in **diio**.

### Parameters

- `name` (required): The name you want to identity your call with.
- `media_url` (required): The location (url) from which diio must fetch the Phone Call recording.
- `duration` (required): The duration in seconds of the Phone Call.
- `user_id` (required): The uuid of the [User](https://www.notion.so/Users-1d7a27f673b18003bc24ce6b2c79f2f7?pvs=21) associated with the Phone Call.
- `call_from_number` (required): The number from which the Phone Call was made.
- `customer_name` (required): The name of the customer that was called.
- `customer_email` (required): The email of the customer that was called.
- `customer_phone` (required): The phone number of the customer that was called.
- `occurred_at` (required): The datetime in UTC when the call was made

### Response

Returns a JSON object with the following properties:

- `id`: The unique identifier of the Phone Call.

### Example

Request:

```
POST /v1/phone_calls
```

Request:

```json
{
	"name": "Call with John",
	"media_url": "https://example.com/location-of-phone-call.mp3",
	"duration": 600,
	"user_id": "c2d83840-fb6d-11ef-b70f-06254876e271",
	"call_from_number": "+130512341234",
	"customer_name": "John Doe",
	"customer_email": "john@doe.com",
	"customer_phone": "+130543214321",
	"occurred_at": "2025-10-01T15:10:05"
}
```

Response:

```json
{
	"id": "343f605a-0bde-11f0-a454-06254876e271"
}

```

## Errors

This API uses the following error codes:

- `400 Bad Request`: The request was malformed or missing required parameters.
- `401 Unauthorized`: The API key provided was invalid or missing. You must refresh your **access_token**.
- `404 Not Found`: The requested resource was not found.
- `500 Internal Server Error`: An unexpected error occurred on the server.

### `GET /v1/phone_calls`

List a Phone Calls in your **diio** account.

### Parameters

- `page` (optional): The page number of the phone calls.
- `limit` (optional): The limit of the amount of phone calls returned in the response.

### Response

Returns a JSON object with the following properties:

- `id`: The unique identifier of the Phone Call.
- `name`: The name of the Phone Call.
- `occurred_at`: The datetime at which the Phone Call occurred.
- `created_at`: The creation datetime of the Phone Call.
- `updated_at`: The datetime at which the Phone Call was updated.
- `attendees`: An object with the attendees to the meeting.

### Example

Request:

```
GET /v1/phone_calls
```

Response:

```json
{
	"phone_calls": [
		{
			"id": "343f605a-0bde-11f0-a454-06254876e271"
			"name": "Call with John",
			"occurred_at": "2025-10-01T15:10:05",
			"created_at": "2025-10-01T15:10:05",
			"updated_at": "2025-10-01T15:10:05",
			"last_trancript_id": "343f605a-0bde-11f0-a454-06254876e281",
			"attendees": {
				"sellers": 
					[
						{
							"name": "John Doe",
							"email": "john.doe@example.com",
							"user_id": "99a2868c-8fa3-11f0-848f-06254876e271"
						}
					],
				"customers":
					[
						{
							"name": "Customer",
							"email": "customer@client.com",
							"phone": "+13055555555"
						}
					]
				}
		},
		...
	],
	"total": 1000,
	"next": 2
}
```

## Errors

This API uses the following error codes:

- `400 Bad Request`: The request was malformed or missing required parameters.
- `401 Unauthorized`: The API key provided was invalid or missing. You must refresh your **access_token**.
- `404 Not Found`: The requested resource was not found.
- `500 Internal Server Error`: An unexpected error occurred on the server.

### `GET /v1/phone_calls/:id`

Show information for a specific Phone Call in your **diio** account.

### Parameters

- `id` (required): The id of the phone call.

### Response

Returns a JSON object with the following properties:

- `name`: The name of the Phone Call.
- `occurred_at`: The datetime at which the Phone Call occurred.
- `created_at`: The creation datetime of the Phone Call.
- `updated_at`: The datetime at which the Phone Call was updated.
- `attendees`: An object with the attendees to the meeting.
- `analyzed_status`: The status of the call (finished, error).
- `error_cause`: The error associated with the call in case there’s any.

### Example

Request:

```
GET /v1/phone_calls/343f605a-0bde-11f0-a454-06254876e271
```

Response:

```json
{
	"id": "343f605a-0bde-11f0-a454-06254876e271"
	"name": "Call with John",
	"occurred_at": "2025-10-01T15:10:05",
	"created_at": "2025-10-01T15:10:05",
	"updated_at": "2025-10-01T15:10:05",
	"last_trancript_id": "343f605a-0bde-11f0-a454-06254876e281",
	"attendees": {
		"sellers": 
			[
				{
					"name": "John Doe",
					"email": "john.doe@example.com",
					"user_id": "99a2868c-8fa3-11f0-848f-06254876e271"
				}
			],
		"customers":
			[
				{
					"name": "Customer",
					"email": "customer@client.com",
					"phone": "+13055555555"
				}
			]
		},
	"analyzed_status": "finished",
	"error_cause": null
}
```

## Errors

This API uses the following error codes:

- `400 Bad Request`: The request was malformed or missing required parameters.
- `401 Unauthorized`: The API key provided was invalid or missing. You must refresh your **access_token**.
- `404 Not Found`: The requested resource was not found.
- `500 Internal Server Error`: An unexpected error occurred on the server.


# Transcripts

## Description

This API is to access transcripts associated to a diio object such as a phone call or a meeting.

## Endpoints

### `GET /v1/transcripts/:id`

Returns a transcript object

### Parameters

- `id` (required): The id associated to the transcript you want to access.
- `email` (optional): The user email from whom you would like to have information.

### Response

Returns a JSON object with the following properties:

- `id`: The id of the transcript object being returned.
- `transcript`: The transcript object.

### Example

Request:

```
GET /v1/transcripts/91992f26-a585-11ee-bc7e-06d5ade5f257
```

Response:

```json
{
	"id": "91992f26-a585-11ee-bc7e-06d5ade5f257",
	"transcript": "Lorem ipsum..."
}

```

## Errors

This API uses the following error codes:

- `400 Bad Request`: The request was malformed or missing required parameters.
- `401 Unauthorized`: The API key provided was invalid or missing. You must refresh your **access_token**.
- `404 Not Found`: The requested resource was not found.
- `500 Internal Server Error`: An unexpected error occurred on the server.


# Users

## Description

This API is to fetch all users on an account or to fetch a specific user by its email.

## Endpoints

### `GET /v1/users`

Returns a list of all users in your account

### Parameters

- `page` (optional): The page corresponding to the users in your account, the limit per page is 10 users.
- `email` (optional): The user email from whom you would like to have information.

### Response

Returns a JSON object with the following properties:

- `users`: An array of user objects, each with the following properties:
    - `id`: The unique identifier of the User.
    - `email`: The user’s email.
    - `name`: The name of the user.

### Example

Request:

```
GET /v1/users
```

Response:

```json
{
	"users": [
		{
			"name": "John Doe",
			"email": "john@doe.com",
			"id": "91992f26-a585-11ee-bc7e-06d5ade5f257"
		},
		{
			"name": "Jane Doe",
			"email": "jane@doe.com",
			"id": "0b3e264a-9b83-11ee-9bd5-06d5ade5f257"
		},
		...
	]
}

```

## Errors

This API uses the following error codes:

- `400 Bad Request`: The request was malformed or missing required parameters.
- `401 Unauthorized`: The API key provided was invalid or missing. You must refresh your **access_token**.
- `404 Not Found`: The requested resource was not found.
- `500 Internal Server Error`: An unexpected error occurred on the server.