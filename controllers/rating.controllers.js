import Rating from "../models/rating.model.js"
import Listener from "../models/listener.model.js"
import Session from "../models/session.model.js"

export const getSpecificListenerRatings = async (request, response) => {
    const { listenerId } = request.params

    try {
        // Dinleyicinin sessionlarını çek
        const listener = await Listener.findById(listenerId).populate('sessions')

        if (!listener) {
            return response.status(404).send({ error: "Listener not found" })
        }

        // Dinleyicinin tüm sessionlarına ait ratingleri çek
        const sessionIds = listener.sessions.map(session => session._id)
        const specificListenerRatings = await Rating.find({ sessionId: { $in: sessionIds } })

        if (!specificListenerRatings) {
            return response.status(404).send({ error: "No ratings found for this listener" })
        }

        response.status(200).send(specificListenerRatings)
    } catch (error) {
        response.status(500).send({ error: "Something went wrong" })
    }
}


export const addRating = async (request, response) => {
    const { sessionId, rating, feedback } = request.body
    if (!sessionId || !rating || !feedback) {
        return response.status(400).send({ error: "Please fill all fields" })
    }
    try {
        // Session'ı bul ve userId ve listenerId bilgilerini al
        const session = await Session.findById(sessionId)

        if (!session) {
            return response.status(404).send({ error: "Session not found" })
        }

        const userId = session.userId
        const listenerId = session.listenerId

        // Yeni rating oluştur
        const newRating = await Rating.create({ sessionId, userId, listenerId, rating, feedback })
        
        // Update the session with the new ratingId
        session.ratingId = newRating._id
        await session.save()

        response.status(201).send(newRating)
    } catch (error) {
        response.status(500).send({ error: "Something went wrong" })
    }

}