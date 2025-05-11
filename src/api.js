const API_BASE_URL = process.env.REACT_APP_VIDEOSDK_API_URL

const API_AUTH_URL = process.env.REACT_APP_AUTH_URL

export const getToken = async () => {
  if (!API_AUTH_URL) {
    console.error("Missing REACT_APP_AUTH_URL in .env")
    return null
  }

  try {
    const res = await fetch(`${API_AUTH_URL}/token-unlocked
`)
    if (!res.ok) throw new Error("Failed to fetch token from Supabase")

    const { token } = await res.json()
    console.log(token, "token is here")
    return token
  } catch (err) {
    console.error("Token Fetch Error:", err)
    return null
  }
}

// export const getToken = async () => {
//   if (VIDEOSDK_TOKEN && API_AUTH_URL) {
//     console.error(
//       "Error: Provide only ONE PARAMETER - either Token or Auth API"
//     );
//   } else if (VIDEOSDK_TOKEN) {
//     return VIDEOSDK_TOKEN;
//   } else if (API_AUTH_URL) {
//     const res = await fetch(`${API_AUTH_URL}/get-token`, {
//       method: "GET",
//     });
//     const { token } = await res.json();
//     return token;
//   } else {
//     console.error("Error: ", Error("Please add a token or Auth Server URL"));
//   }
// };

export const createMeeting = async ({ token }) => {
  console.log("this is called", token)
  const url = `${API_BASE_URL}/v2/rooms`
  const options = {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
  }

  const response = await fetch(url, options)
  const data = await response.json()

  if (data.roomId) {
    return { meetingId: data.roomId, err: null }
  } else {
    return { meetingId: null, err: data.error }
  }
}

export const validateMeeting = async ({ roomId, token }) => {
  const url = `${API_BASE_URL}/v2/rooms/validate/${roomId}`

  const options = {
    method: "GET",
    headers: { Authorization: token, "Content-Type": "application/json" },
  }

  const response = await fetch(url, options)

  if (response.status === 400) {
    const data = await response.text()
    return { meetingId: null, err: data }
  }

  const data = await response.json()

  if (data.roomId) {
    return { meetingId: data.roomId, err: null }
  } else {
    return { meetingId: null, err: data.error }
  }
}
