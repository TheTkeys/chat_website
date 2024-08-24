import type { RobotFormInterface } from '@/interface/types'
import request from './network'

export function getAllRobots() {
  return request('/robot/all', 'GET')
}

export function getPublicRobots() {
  return request('/robot/selectPublicRobots', 'GET')
}

export function getRobots() {
  return request('/robot/selectByUid', 'GET')
}

export function createRobot(robot: RobotFormInterface) {
  return request('/robot/create', 'POST', robot)
}

export function deleteRobot(robotId: number) {
  return request(`/robot?robotId=${robotId}`, 'DELETE')
}
