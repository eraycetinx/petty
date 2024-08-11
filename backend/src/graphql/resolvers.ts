import { Context } from "../context";
import {
  ICreateInput,
  ILoginType,
  ILoginInput,
  IUpdateUserInput,
  ICreatePet,
  IUpdatePetInput,
  ICreateReviewInput,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { generateToken } from "../helpers/token";
import pubsub from "../helpers/pubsub";
import { withFilter } from "graphql-subscriptions";

const resolvers = {
  Node: {
    __resolveType(obj: any) {
      if (obj.email) {
        return "User";
      }
      if (obj.name) {
        return "Pet";
      }
      if (obj.rating) {
        return "Review";
      }
      if (obj.status) {
        return "Request";
      }
      throw Error("Could not resolve type");
    },
  },
  Query: {
    caregivers: async (_: any, __: any, { prisma, loginedUser }: Context) => {
      if (!loginedUser) {
        return {
          status: false,
          message: "Unauthorized",
          node: [],
        };
      }

      const allCaregiver = await prisma.user.findMany({
        where: {
          role: "Caregiver",
        },
      });

      const caregiverRaing = await prisma.review.findMany({
        where: {
          revieweeUuid: {
            in: allCaregiver.map((caregiver) => caregiver.uuid),
          },
        },
        select: {
          revieweeUuid: true,
          rating: true,
        },
      });

      const node = allCaregiver.map((caregiver) => {
        const rating = caregiverRaing.filter(
          (rating) => rating.revieweeUuid === caregiver.uuid
        );

        return {
          ...caregiver,
          rating: rating.reduce((acc, curr) => acc + curr.rating, 0),
        };
      });

      return {
        status: true,
        message: "Success",
        node: node.map((c) => c),
      };
    },
    Owner: async (_: any, __: any, { prisma, loginedUser }: Context) => {
      if (!loginedUser) {
        return {
          status: false,
          message: "Unauthorized",
          node: [],
        };
      }

      const allOwner = await prisma.user.findMany({
        where: {
          role: "Owner",
        },
      });

      return {
        status: true,
        message: "Success",
        node: allOwner.map((c) => c),
      };
    },
    userProfile: async (
      _: any,
      { uuid }: { uuid: string },
      { prisma, loginedUser }: Context
    ) => {
      if (!loginedUser) {
        return {
          status: false,
          message: "Unauthorized",
          node: [],
        };
      }

      const user = await prisma.user.findFirst({
        where: {
          uuid,
        },
        select: {
          Pet: true,
          Details: true,
          Picture: true,
          Reviewer: true,
        },
      });

      if (!user) {
        return {
          status: false,
          message: "User not found",
          node: [],
        };
      }

      return {
        status: true,
        message: "Success",
        node: [user],
      };
    },
    searchCaregiver: async (
      _: any,
      { name }: { name: string },
      { prisma }: Context
    ) => {
      try {
        const caregivers = await prisma.user.findMany({
          where: {
            role: "Caregiver",
            Details: {
              name: {
                contains: name,
                mode: "insensitive",
              },
            },
          },
        });

        return {
          status: true,
          message: "Success",
          node: caregivers,
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    caregiverRequests: async (
      _: any,
      __: any,
      { prisma, loginedUser }: Context
    ) => {
      if (!loginedUser) {
        return {
          status: false,
          message: "Unauthorized",
          node: [],
        };
      }

      const requests = await prisma.request.findMany({
        where: {
          ownerUuid: loginedUser.uuid,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        status: true,
        message: "Success",
        node: requests,
      };
    },
  },
  Mutation: {
    createUser: async (
      _: any,
      args: ICreateInput,
      { prisma }: Context
    ): Promise<ILoginType> => {
      try {
        const {
          deviceToken,
          email,
          password,
          username,
          userDetails: { lastName, name, phone, gender },
        } = args;

        const requiredFields: Array<keyof ICreateInput> = [
          "username",
          "email",
          "password",
          "deviceToken",
          "userDetails",
        ];

        // Kontrol edilecek tüm alanları belirleyin
        const fieldsToCheck = [
          ...requiredFields,
          "userDetails.name",
          "userDetails.lastName",
          "userDetails.phone",
          "userDetails.gender",
        ];

        for (const field of fieldsToCheck) {
          const value = field.includes(".")
            ? (args as any)[field.split(".")[0]][field.split(".")[1]]
            : (args as any)[field];

          if (typeof value === "string" && value.trim().length === 0) {
            return {
              status: false,
              message: "Please provide all required fields.",
              token: "",
            };
          } else if (value === undefined || value === null) {
            return {
              status: false,
              message: "Please provide all required fields.",
              token: "",
            };
          }
        }

        // user email valid mi
        if (
          !email.match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          )
        ) {
          return {
            status: false,
            message: "email is not valid",
            token: "",
          };
        }

        const userIsExist = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { username }],
          },
        });

        if (userIsExist) {
          return {
            status: false,
            message: "User is already exist",
            token: "",
          };
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const createdUser = await prisma.user.create({
          data: {
            uuid: uuidv4(),
            username,
            email,
            password: hashedPassword,
            deviceToken,
            Details: {
              create: {
                uuid: uuidv4(),
                name,
                lastName,
                phone,
                isVerified: false,
                gender,
              },
            },
          },
        });

        return {
          status: true,
          message: "User created successfully",
          token: generateToken({
            email: createdUser.email,
            username: createdUser.username,
            uuid: createdUser.uuid,
          }),
        };
      } catch (error) {
        return {
          status: false,
          message: "Error",
          token: "",
        };
      }
    },
    signIn: async (
      _: any,
      { deviceToken, password, email }: ILoginInput,
      { prisma }: Context
    ): Promise<ILoginType> => {
      try {
        if (!email.trim() || !password.trim() || !deviceToken.trim()) {
          return {
            status: false,
            message: "Please provide all required fields.",
            token: "",
          };
        }

        // user email valid mi
        if (
          !email.match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          )
        ) {
          return {
            status: false,
            message: "email is not valid",
            token: "",
          };
        }

        const user = await prisma.user.findFirst({
          where: {
            email,
          },
        });

        if (!user) {
          return {
            status: false,
            message: "User not found",
            token: "",
          };
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
          return {
            status: false,
            message: "Password is incorrect",
            token: "",
          };
        }

        return {
          status: true,
          message: "Success",
          token: generateToken({
            email: user.email,
            username: user.username,
            uuid: user.uuid,
          }),
        };
      } catch (error) {
        return {
          status: false,
          message: "Error",
          token: "",
        };
      }
    },
    updateUserProfile: async (
      _: any,
      { uuid, role, userDetails }: IUpdateUserInput,
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserExist = await prisma.user.findFirst({
          where: {
            uuid,
          },
        });

        if (!isUserExist) {
          return {
            status: false,
            message: "User not found",
            node: [],
          };
        }

        const updateUser = await prisma.user.update({
          where: {
            uuid,
          },
          data: {
            role,
          },
        });

        if (userDetails) {
          const updatedUserDetails = await prisma.details.update({
            where: {
              uuid,
            },
            data: {
              ...userDetails,
            },
          });

          const node = {
            ...updateUser,
            Details: updatedUserDetails,
          };

          return {
            status: true,
            message: "User updated successfully",
            node,
          };
        } else {
          return {
            status: true,
            message: "User updated successfully",
            node: updateUser,
          };
        }
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    deleteUserProfile: async (
      _: any,
      { uuid }: { uuid: string },
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserExist = await prisma.user.findFirst({
          where: {
            uuid,
          },
        });

        if (!isUserExist) {
          return {
            status: false,
            message: "User not found",
            node: [],
          };
        }

        await prisma.user.delete({
          where: {
            uuid,
          },
        });

        return {
          status: true,
          message: "User deleted successfully",
          node: [],
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    createPet: async (
      _: any,
      { name, breed, age, gender }: ICreatePet,
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserOwner = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Owner",
          },
        });

        if (!isUserOwner) {
          return {
            status: false,
            message: "You are not authorized to create pet",
            node: [],
          };
        }

        const pet = await prisma.pet.create({
          data: {
            uuid: uuidv4(),
            gender,
            name,
            breed,
            age,
            createdAt: new Date(),
            owner: {
              connect: {
                uuid: loginedUser.uuid,
              },
            },
          },
        });

        return {
          status: true,
          message: "Pet created successfully",
          node: pet,
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    updatePet: async (
      _: any,
      { uuid, name, breed, age }: IUpdatePetInput,
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserOwner = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Owner",
            Pet: {
              some: {
                ownerUuid: loginedUser.uuid,
              },
            },
          },
        });

        if (!isUserOwner) {
          return {
            status: false,
            message: "You are not authorized to update pet",
            node: [],
          };
        }

        const isPetExist = await prisma.pet.findFirst({
          where: {
            uuid,
          },
        });

        if (!isPetExist) {
          return {
            status: false,
            message: "Pet not found",
            node: [],
          };
        }

        const updatedPet = await prisma.pet.update({
          where: {
            uuid,
          },
          data: {
            name,
            breed,
            age,
          },
        });

        return {
          status: true,
          message: "Pet updated successfully",
          node: updatedPet,
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    deletePet: async (
      _: any,
      { uuid }: { uuid: string },
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserOwner = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Owner",
            Pet: {
              some: {
                ownerUuid: loginedUser.uuid,
              },
            },
          },
        });

        if (!isUserOwner) {
          return {
            status: false,
            message: "You are not authorized to delete pet",
            node: [],
          };
        }

        const isPetExist = await prisma.pet.findFirst({
          where: {
            uuid,
          },
        });

        if (!isPetExist) {
          return {
            status: false,
            message: "Pet not found",
            node: [],
          };
        }

        await prisma.pet.delete({
          where: {
            uuid,
          },
        });

        return {
          status: true,
          message: "Pet deleted successfully",
          node: [],
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    findCaregiver: async (
      _: any,
      { name }: { name: string },
      { prisma }: Context
    ) => {
      try {
        const caregivers = await prisma.user.findMany({
          where: {
            role: "Caregiver",
            Details: {
              name: {
                contains: name,
                mode: "insensitive",
              },
            },
          },
        });

        return {
          status: true,
          message: "Success",
          node: caregivers,
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    createReview: async (
      _: any,
      { caregiverUuid, rating, comment }: ICreateReviewInput,
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserOwner = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Owner",
          },
        });

        if (!isUserOwner) {
          return {
            status: false,
            message: "You are not authorized to create review",
            node: [],
          };
        }

        const isCaregiverExist = await prisma.user.findFirst({
          where: {
            uuid: caregiverUuid,
            role: "Caregiver",
          },
        });

        if (!isCaregiverExist) {
          return {
            status: false,
            message: "Caregiver not found",
            node: [],
          };
        }

        const isRequestExist = await prisma.request.findFirst({
          where: {
            ownerUuid: loginedUser.uuid,
            caregiverUuid,
            status: "Completed",
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (!isRequestExist) {
          return {
            status: false,
            message: "You can only review caregiver that you have hired",
            node: [],
          };
        }

        if (isRequestExist.reviewed) {
          return {
            status: false,
            message: "You have already reviewed this caregiver",
            node: [],
          };
        }

        const review = await prisma.review
          .create({
            data: {
              uuid: uuidv4(),
              rating,
              comment,
              reviewer: {
                connect: {
                  uuid: loginedUser.uuid,
                },
              },
              reviewee: {
                connect: {
                  uuid: caregiverUuid,
                },
              },
              request: {
                connect: {
                  uuid: isRequestExist.uuid,
                },
              },
            },
          })
          .then(async () => {
            await prisma.request.update({
              where: {
                uuid: isRequestExist.uuid,
              },
              data: {
                reviewed: true,
              },
            });
          });

        return {
          status: true,
          message: "Review created successfully",
          node: review,
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    deleteReview: async (
      _: any,
      { uuid }: { uuid: string },
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserOwner = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Owner",
          },
        });

        if (!isUserOwner) {
          return {
            status: false,
            message: "You are not authorized to delete review",
            node: [],
          };
        }

        const isReviewExist = await prisma.review.findFirst({
          where: {
            uuid,
            reviewerUuid: loginedUser.uuid,
          },
        });

        if (!isReviewExist) {
          return {
            status: false,
            message: "Review not found",
            node: [],
          };
        }

        await prisma.review
          .delete({
            where: {
              uuid,
            },
          })
          .then(async () => {
            await prisma.request.update({
              where: {
                uuid: isReviewExist.reuqestUuid,
              },
              data: {
                reviewed: false,
              },
            });
          });

        return {
          status: true,
          message: "Review deleted successfully",
          node: [],
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    favoriteCaregiver: async (
      _: any,
      { caregiverUuid }: { caregiverUuid: string },
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserOwner = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Owner",
          },
        });

        if (!isUserOwner) {
          return {
            status: false,
            message: "You are not authorized to favorite caregiver",
            node: [],
          };
        }

        const isCaregiverExist = await prisma.user.findFirst({
          where: {
            uuid: caregiverUuid,
            role: "Caregiver",
          },
        });

        if (!isCaregiverExist) {
          return {
            status: false,
            message: "Caregiver not found",
            node: [],
          };
        }

        const isFavoriteExist = await prisma.favorite.findFirst({
          where: {
            ownerUuid: loginedUser.uuid,
            caregiverUuid,
          },
        });

        if (isFavoriteExist) {
          return {
            status: false,
            message: "Caregiver already in favorite list",
            node: [],
          };
        }

        const node = await prisma.favorite.create({
          data: {
            uuid: uuidv4(),
            owner: {
              connect: {
                uuid: loginedUser.uuid,
              },
            },
            caregiver: {
              connect: {
                uuid: caregiverUuid,
              },
            },
          },
        });

        return {
          status: true,
          message: "Caregiver added to favorite list",
          node: [node],
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    unfavoriteCaregiver: async (
      _: any,
      { uuid }: { uuid: string },
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserOwner = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Owner",
          },
        });

        if (!isUserOwner) {
          return {
            status: false,
            message: "You are not authorized to unfavorite caregiver",
            node: [],
          };
        }

        const isFavoriteExist = await prisma.favorite.findFirst({
          where: {
            uuid,
            ownerUuid: loginedUser.uuid,
          },
        });

        if (!isFavoriteExist) {
          return {
            status: false,
            message: "Favorite not found",
            node: [],
          };
        }

        await prisma.favorite.delete({
          where: {
            uuid,
          },
        });

        return {
          status: true,
          message: "Caregiver removed from favorite list",
          node: [],
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    requestHired: async (
      _: any,
      { caregiverUuid, petUuid }: { caregiverUuid: string; petUuid: string },
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserOwner = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Owner",
          },
        });

        if (!isUserOwner) {
          return {
            status: false,
            message: "You are not authorized to request caregiver",
            node: [],
          };
        }

        const isPetExist = await prisma.pet.findFirst({
          where: {
            uuid: petUuid,
            ownerUuid: loginedUser.uuid,
          },
        });

        if (!isPetExist) {
          return {
            status: false,
            message: "Pet not found",
            node: [],
          };
        }

        const isCaregiverExist = await prisma.user.findFirst({
          where: {
            uuid: caregiverUuid,
            role: "Caregiver",
          },
        });

        if (!isCaregiverExist) {
          return {
            status: false,
            message: "Caregiver not found",
            node: [],
          };
        }

        const isRequestExist = await prisma.request.findFirst({
          where: {
            ownerUuid: loginedUser.uuid,
            caregiverUuid,
            status: "Pending",
          },
        });

        if (isRequestExist) {
          return {
            status: false,
            message: "Request already exist",
            node: [],
          };
        }

        const node = await prisma.request.create({
          data: {
            uuid: uuidv4(),
            owner: {
              connect: {
                uuid: loginedUser.uuid,
              },
            },
            caregiver: {
              connect: {
                uuid: caregiverUuid,
              },
            },
            pet: {
              connect: {
                uuid: petUuid,
              },
            },
            status: "Pending",
            reviewed: false,
          },
        });

        return {
          status: true,
          message: "Request created successfully",
          node: [node],
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    cancelRequest: async (
      _: any,
      { requestUuid }: { requestUuid: string },
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserOwner = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Owner",
          },
        });

        if (!isUserOwner) {
          return {
            status: false,
            message: "You are not authorized to cancel request",
            node: [],
          };
        }

        const isRequestExist = await prisma.request.findFirst({
          where: {
            uuid: requestUuid,
            ownerUuid: loginedUser.uuid,
            status: "Pending",
          },
        });

        if (!isRequestExist) {
          return {
            status: false,
            message: "Request not found",
            node: [],
          };
        }

        const deletedNode = await prisma.request.delete({
          where: {
            uuid: isRequestExist.uuid,
          },
        });

        return {
          status: true,
          message: "Request canceled successfully",
          node: [deletedNode],
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    acceptRequest: async (
      _: any,
      { requestUuid }: { requestUuid: string },
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserCaregiver = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Caregiver",
          },
        });

        if (!isUserCaregiver) {
          return {
            status: false,
            message: "You are not authorized to accept request",
            node: [],
          };
        }

        const isRequestExist = await prisma.request.findFirst({
          where: {
            uuid: requestUuid,
            caregiverUuid: loginedUser.uuid,
            status: "Pending",
          },
        });

        if (!isRequestExist) {
          return {
            status: false,
            message: "Request not found",
            node: [],
          };
        }

        const updatedNode = await prisma.request.update({
          where: {
            uuid: isRequestExist.uuid,
          },
          data: {
            status: "Accepted",
          },
        });

        pubsub.publish("currentHired", {
          currentHired: updatedNode,
        });

        return {
          status: true,
          message: "Request accepted successfully",
          node: [updatedNode],
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    rejectRequest: async (
      _: any,
      { requestUuid }: { requestUuid: string },
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserCaregiver = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Caregiver",
          },
        });

        if (!isUserCaregiver) {
          return {
            status: false,
            message: "You are not authorized to reject request",
            node: [],
          };
        }

        const isRequestExist = await prisma.request.findFirst({
          where: {
            uuid: requestUuid,
            caregiverUuid: loginedUser.uuid,
            status: "Pending",
          },
        });

        if (!isRequestExist) {
          return {
            status: false,
            message: "Request not found",
            node: [],
          };
        }

        const updateNode = await prisma.request.update({
          where: {
            uuid: isRequestExist.uuid,
          },
          data: {
            status: "Rejected",
          },
        });

        pubsub.publish("currentHired", {
          currentHired: updateNode,
        });

        return {
          status: true,
          message: "Request rejected successfully",
          node: [updateNode],
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
    complateRequest: async (
      _: any,
      { requestUuid }: { requestUuid: string },
      { prisma, loginedUser }: Context
    ) => {
      try {
        if (!loginedUser) {
          return {
            status: false,
            message: "Unauthorized",
            node: [],
          };
        }

        const isUserCaregiver = await prisma.user.findFirst({
          where: {
            uuid: loginedUser.uuid,
            role: "Caregiver",
          },
        });

        if (!isUserCaregiver) {
          return {
            status: false,
            message: "You are not authorized to complete request",
            node: [],
          };
        }

        const isRequestExist = await prisma.request.findFirst({
          where: {
            uuid: requestUuid,
            caregiverUuid: loginedUser.uuid,
            status: "Accepted",
          },
        });

        if (!isRequestExist) {
          return {
            status: false,
            message: "Request not found",
            node: [],
          };
        }

        const updatedNode = await prisma.request.update({
          where: {
            uuid: isRequestExist.uuid,
          },
          data: {
            status: "Completed",
          },
        });

        pubsub.publish("currentHired", {
          currentHired: updatedNode,
        });

        return {
          status: true,
          message: "Request completed successfully",
          node: [updatedNode],
        };
      } catch (error) {
        return {
          status: false,
          message: `${error}`,
          node: [],
        };
      }
    },
  },
  Subscription: {
    currentHired: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("currentHired"),
        ({ currentHired }, _: any, { loginedUser }: Context) => {
          return (
            currentHired.caregiverUuid === loginedUser.uuid ||
            currentHired.ownerUuid === loginedUser.uuid
          );
        }
      ),
      resolve: (payload: any) => {
        return {
          status: true,
          message: "Success",
          node: [payload.currentHired],
        };
      },
    },
  },
};

export default resolvers;
