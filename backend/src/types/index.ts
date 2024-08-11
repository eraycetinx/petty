enum Role {
  Caregiver = "Caregiver",
  Owner = "Owner",
}

enum Gender {
  Male = "Male",
  Female = "Female",
}

export interface ICreateInput {
  username: string;
  email: string;
  password: string;
  deviceToken: string;
  userDetails: {
    name: string;
    lastName: string;
    phone: string;
    gender: Gender;
  };
}

export interface ILoginInput {
  email: string;
  password: string;
  deviceToken: string;
}

export interface ILoginType {
  status: boolean;
  message: string;
  token: string;
}

export interface IUpdateUserInput {
  uuid: string;
  username: string;
  email: string;
  password: string;
  deviceToken: string;
  role: Role;
  userDetails: {
    name: string;
    lastName: string;
    phone: string;
  };
}

export interface ICreatePet {
  name: string;
  breed: string;
  age: number;
  gender: Gender;
}

export interface IUpdatePetInput {
  uuid: string;
  name: string;
  breed: string;
  age: number;
}

export interface ICreateReviewInput {
  caregiverUuid: string;
  rating: number;
  comment: string;
}
