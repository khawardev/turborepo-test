export function timeAgo(dateString: string) {
    const date = new Date(dateString)
    date.setHours(date.getHours() + 5)
    const now = new Date()
    const diff = (now.getTime() - date.getTime()) / 1000
    const units = [
        { name: 'year', seconds: 31536000 },
        { name: 'month', seconds: 2592000 },
        { name: 'day', seconds: 86400 },
        { name: 'hour', seconds: 3600 },
        { name: 'min', seconds: 60 },
        { name: 'sec', seconds: 1 },
    ]

    for (const unit of units) {
        const interval = Math.floor(diff / unit.seconds)
        if (interval >= 1)
            return `${interval} ${unit.name}${interval > 1 ? 's' : ''} ago`
    }

    return 'just now'
}