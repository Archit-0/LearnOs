import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Progress } from "../ui/Progress"
import { FileText, Play, CheckCircle, Clock } from "lucide-react"

export default function SimpleBatchSystem({ isRunning }) {
  const [jobs, setJobs] = useState([
    { id: 1, name: "Payroll System", duration: 5000, progress: 0, status: "waiting" },
    { id: 2, name: "Inventory Update", duration: 3000, progress: 0, status: "waiting" },
    { id: 3, name: "Report Generation", duration: 4000, progress: 0, status: "waiting" },
    { id: 4, name: "Data Backup", duration: 6000, progress: 0, status: "waiting" },
  ])

  const [currentJobIndex, setCurrentJobIndex] = useState(0)

  useEffect(() => {
    if (!isRunning) {
      setJobs(jobs => jobs.map(job => ({ ...job, progress: 0, status: "waiting" })))
      setCurrentJobIndex(0)
      return
    }

    const interval = setInterval(() => {
      setJobs(prevJobs => {
        const newJobs = [...prevJobs]
        const currentJob = newJobs[currentJobIndex]

        if (currentJob && currentJob.status !== "completed") {
          currentJob.status = "running"
          currentJob.progress += 100 / (currentJob.duration / 100)

          if (currentJob.progress >= 100) {
            currentJob.progress = 100
            currentJob.status = "completed"
            setCurrentJobIndex(prev => prev + 1)
          }
        }

        return newJobs
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, currentJobIndex])

  const completedJobs = jobs.filter(job => job.status === "completed").length
  const totalJobs = jobs.length

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">Simple Batch System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-4">
                In a Simple Batch System, jobs are collected into batches and processed sequentially.
                The CPU executes one job completely before starting the next one.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-green-400">Characteristics:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Jobs processed one at a time</li>
                  <li>• No user interaction during execution</li>
                  <li>• High throughput for non-interactive jobs</li>
                  <li>• Simple job scheduling (FIFO)</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <h4 className="font-semibold text-red-400">Disadvantages:</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Poor CPU utilization</li>
                  <li>• Long waiting times</li>
                  <li>• No interactive processing</li>
                  <li>• Difficult debugging</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Queue Visualization */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-blue-400">Job Queue</CardTitle>
            <div className="text-sm text-gray-400">
              Progress: {completedJobs}/{totalJobs} jobs completed
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <div
                key={job.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${job.status === "running"
                  ? "border-blue-500 bg-blue-900/20"
                  : job.status === "completed"
                    ? "border-green-500 bg-green-900/20"
                    : "border-gray-600 bg-gray-700"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {job.status === "completed" ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : job.status === "running" ? (
                      <Play className="w-8 h-8 text-blue-400 animate-pulse" />
                    ) : (
                      <Clock className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{job.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${job.status === "completed"
                        ? "bg-green-500 text-white"
                        : job.status === "running"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-500 text-white"
                        }`}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                    {job.status !== "waiting" && (
                      <Progress
                        value={job.progress}
                        className="h-2"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System State */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">System State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{jobs.filter(j => j.status === "waiting").length}</div>
              <div className="text-sm text-gray-400">Jobs Waiting</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <Play className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{jobs.filter(j => j.status === "running").length}</div>
              <div className="text-sm text-gray-400">Jobs Running</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <CheckCircle className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{jobs.filter(j => j.status === "completed").length}</div>
              <div className="text-sm text-gray-400">Jobs Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
