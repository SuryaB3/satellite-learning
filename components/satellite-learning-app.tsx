"use client"

import { useState, useEffect, useRef } from "react"
import { Camera, Award, Rocket, Satellite } from "lucide-react"

const SatelliteLearningApp = () => {
  const [currentPhase, setCurrentPhase] = useState("welcome") // welcome, lesson, quiz, results
  const [webcamEnabled, setWebcamEnabled] = useState(false)
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
  const [lessonProgress, setLessonProgress] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizScore, setQuizScore] = useState(0)
  const [badgeEarned, setBadgeEarned] = useState(false)
  const [avatarSpeaking, setAvatarSpeaking] = useState(false)
  const [currentLessonStep, setCurrentLessonStep] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Lesson content
  const lessonSteps = [
    {
      title: "Welcome to Satellite Building!",
      content:
        "Hi there, space explorer! I'm Captain Cosmo, and today we're going to learn how to build our very own satellite! Are you ready for an amazing space adventure?",
      duration: 4000,
    },
    {
      title: "What is a Satellite?",
      content:
        "A satellite is like a super cool robot that orbits around Earth in space! It can take pictures, help with GPS, and even let us talk to people far away. Think of it as Earth's helpful space friend!",
      duration: 6000,
    },
    {
      title: "Satellite Components",
      content:
        "Every satellite needs four main parts: Solar panels for power - like giving it energy from the sun! An antenna to communicate with Earth, cameras or sensors to do its job, and a strong body to protect everything inside.",
      duration: 7000,
    },
    {
      title: "How Satellites Stay in Space",
      content:
        "Satellites don't fall down because they're moving super fast around Earth! It's like when you spin a ball on a string - the faster it goes, the more it wants to fly away, but Earth's gravity keeps pulling it back. Perfect balance!",
      duration: 8000,
    },
    {
      title: "Real Satellite Missions",
      content:
        "Some satellites help predict the weather, others take amazing photos of space, and some even help scientists study climate change! The Hubble Space Telescope is a famous satellite that shows us beautiful pictures of distant galaxies!",
      duration: 7000,
    },
  ]

  // Quiz questions
  const quizQuestions = [
    {
      id: 1,
      question: "What keeps satellites from falling back to Earth?",
      options: ["Magic", "Earth's gravity and their speed", "Rocket fuel", "Air balloons"],
      correct: 1,
    },
    {
      id: 2,
      question: "What do satellites use to get power in space?",
      options: ["Batteries only", "Solar panels", "Wind power", "Nuclear reactors"],
      correct: 1,
    },
    {
      id: 3,
      question: "Which of these is NOT a main component of a satellite?",
      options: ["Solar panels", "Antenna", "Wheels", "Camera or sensors"],
      correct: 2,
    },
    {
      id: 4,
      question: "What is the Hubble Space Telescope famous for?",
      options: ["Weather prediction", "Taking pictures of space", "GPS navigation", "Phone calls"],
      correct: 1,
    },
  ]

  // Request webcam permission
  const requestWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setWebcamStream(stream)
      setWebcamEnabled(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Webcam access denied:", error)
      alert("Webcam access is optional but helps create a more personal learning experience!")
    }
  }

  // Text-to-speech function
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.2
      utterance.volume = 0.8

      utterance.onstart = () => setAvatarSpeaking(true)
      utterance.onend = () => setAvatarSpeaking(false)

      window.speechSynthesis.speak(utterance)
      speechSynthRef.current = utterance
    }
  }

  // Start lesson
  const startLesson = () => {
    setCurrentPhase("lesson")
    setCurrentLessonStep(0)
    setTimeout(() => {
      speakText(lessonSteps[0].content)
    }, 500)
  }

  // Progress through lesson
  useEffect(() => {
    if (currentPhase === "lesson" && currentLessonStep < lessonSteps.length) {
      const timer = setTimeout(() => {
        if (currentLessonStep < lessonSteps.length - 1) {
          setCurrentLessonStep(currentLessonStep + 1)
          setLessonProgress(((currentLessonStep + 1) / lessonSteps.length) * 100)
          speakText(lessonSteps[currentLessonStep + 1].content)
        } else {
          setCurrentPhase("quiz")
          setLessonProgress(100)
          speakText("Great job listening! Now let's test what you've learned with a fun quiz!")
        }
      }, lessonSteps[currentLessonStep]?.duration || 5000)

      return () => clearTimeout(timer)
    }
  }, [currentLessonStep, currentPhase])

  // Handle quiz answer
  const handleQuizAnswer = (questionId: number, answerIndex: number) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answerIndex })
  }

  // Submit quiz
  const submitQuiz = () => {
    let score = 0
    quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) {
        score++
      }
    })
    setQuizScore(score)

    if (score >= 3) {
      setBadgeEarned(true)
      speakText(
        `Congratulations! You scored ${score} out of ${quizQuestions.length}! You've earned the Satellite Builder badge!`,
      )
    } else {
      speakText(`Good try! You scored ${score} out of ${quizQuestions.length}. Keep learning about satellites!`)
    }

    setCurrentPhase("results")
  }

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Stop any ongoing speech
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel()
      }

      // Stop webcam stream
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [webcamStream])

  // Avatar component
  const Avatar = () => (
    <div className={`relative w-32 h-32 mx-auto mb-6 ${avatarSpeaking ? "animate-pulse" : ""}`}>
      <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Satellite className={`w-16 h-16 text-white ${avatarSpeaking ? "animate-bounce" : ""}`} />
      </div>
      {avatarSpeaking && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  )

  // Welcome Phase
  if (currentPhase === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <Avatar />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Build Your Own Satellite!</h1>
          <p className="text-gray-600 mb-6">
            Join Captain Cosmo on an exciting journey to learn about satellites and space exploration!
          </p>

          <div className="space-y-4">
            <button
              onClick={requestWebcam}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-5 h-5" />
              {webcamEnabled ? "Webcam Ready!" : "Enable Webcam (Optional)"}
            </button>

            <button
              onClick={startLesson}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Rocket className="w-5 h-5" />
              Start Space Adventure!
            </button>
          </div>

          {webcamEnabled && (
            <div className="mt-6">
              <video ref={videoRef} autoPlay muted className="w-24 h-18 rounded-lg mx-auto border-2 border-blue-300" />
              <p className="text-sm text-gray-500 mt-2">Looking great, space explorer!</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Lesson Phase
  if (currentPhase === "lesson") {
    const currentStep = lessonSteps[currentLessonStep]
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Space Lesson</h2>
            {webcamEnabled && (
              <video ref={videoRef} autoPlay muted className="w-20 h-15 rounded-lg border-2 border-blue-300" />
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${lessonProgress}%` }}
            ></div>
          </div>

          <Avatar />

          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{currentStep?.title}</h3>
            <p className="text-gray-600 text-lg leading-relaxed">{currentStep?.content}</p>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              {lessonSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${index <= currentLessonStep ? "bg-blue-500" : "bg-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quiz Phase
  if (currentPhase === "quiz") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Quiz Time!</h2>
            {webcamEnabled && (
              <video ref={videoRef} autoPlay muted className="w-20 h-15 rounded-lg border-2 border-blue-300" />
            )}
          </div>

          <Avatar />

          <div className="space-y-6">
            {quizQuestions.map((question, qIndex) => (
              <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  {qIndex + 1}. {question.question}
                </h3>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <button
                      key={oIndex}
                      onClick={() => handleQuizAnswer(question.id, oIndex)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        quizAnswers[question.id] === oIndex
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={submitQuiz}
            disabled={Object.keys(quizAnswers).length < quizQuestions.length}
            className="w-full mt-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg transition-colors"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    )
  }

  // Results Phase
  if (currentPhase === "results") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <Avatar />

          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mission Complete!</h2>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {quizScore}/{quizQuestions.length}
            </div>
            <p className="text-gray-600">Questions Correct</p>
          </div>

          {badgeEarned && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6">
              <Award className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-bold text-yellow-700 mb-2">Satellite Builder Badge Earned!</h3>
              <p className="text-yellow-600 text-sm">You're now a certified satellite expert!</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => {
                setCurrentPhase("lesson")
                setCurrentLessonStep(0)
                setLessonProgress(0)
                setQuizAnswers({})
                setQuizScore(0)
                setBadgeEarned(false)
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition-colors"
            >
              Take Lesson Again
            </button>

            <button
              onClick={() => {
                setCurrentPhase("welcome")
                setCurrentLessonStep(0)
                setLessonProgress(0)
                setQuizAnswers({})
                setQuizScore(0)
                setBadgeEarned(false)
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>

          {webcamEnabled && (
            <div className="mt-6">
              <video ref={videoRef} autoPlay muted className="w-24 h-18 rounded-lg mx-auto border-2 border-blue-300" />
              <p className="text-sm text-gray-500 mt-2">Great job, space explorer!</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default SatelliteLearningApp
