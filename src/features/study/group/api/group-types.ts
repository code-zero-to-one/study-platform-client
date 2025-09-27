import {
  ExperienceLevelOption,
  MethodOption,
  RegularMeetingOption,
  TypeOption,
} from '../const/group-const';

export interface OpenGroupRequest {
  type: TypeOption;
  targetRole: string;
  maxMembers: number;
  experienceLevel: ExperienceLevelOption;
  method: MethodOption;
  regularMeeting: RegularMeetingOption;
  startDate: string;
  durationWeeks: number;
  price: number;
}
