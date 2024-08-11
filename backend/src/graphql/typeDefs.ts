const typeDefs = `#graphql
    scalar Date

    enum Role {
        Owner
        Caregiver
    }

    enum Gender {
        Male
        Female
    }

    enum RequestStatus {
        Pending
        Accepted
        Rejected
        Completed
    }

    enum CurrentStatus {
        Delivering #gezdiriliyor
        Current #gezdiriyor
        Completed #gezdirildi getiriliyor
    }
    
    type User {
        uuid: ID!
        username: String!
        email: String!
        password: String!
        deviceToken: String!
        role: Role!
        rating: Int!
        createdAt: Date!

        details: Details!
        # location: Location!
    }

    type Review {
        uuid: ID!
        rating: Int!
        comment: String!
        createdAt: Date!
        updatedAt: Date!
    }

    type Pet {
        uuid: ID!
        name: String!
        breed: String!
        age: Int!
        createdAt: Date!
        owner: User!
    }

    type Details {
        uuid: ID!
        userUuid: String!
        name: String!
        lastName: String!
        phone: String!
        isVerified: Boolean!
        gender: Gender!
        createdAt: Date!
    }

    type Request {
        uuid: ID!
        status: RequestStatus!
        caregiver: User!
        startDate: Date!
        endDate: Date
        reviewed: Boolean!
        pet: Pet!
        createdAt: Date!
        updatedAt: Date!
    }

    union Node = Pet | User | Review | Request

    type LoginType {
        status: Boolean!
        message: String!
        token: String!
    }

    type QueryType {
        status: Boolean!
        message: String!
        node: [Node!]!
    }

    input detailsInput {
        name: String!
        lastName: String!
        phone: String!
        gender: Gender!
    }

    type Query {
        caregivers: QueryType!
        Owner: QueryType!
        userProfile(uuid: ID!): QueryType!
        pets: QueryType!
        searchCaregiver(name: String): QueryType!
        caregiverRequests: QueryType!
    }

    type Subscription {
        currentHired: QueryType!
    }
    
    type Mutation {
        createUser(
            username: String!,
            email: String!,
            password: String!,
            deviceToken: String!, 
            userDetails: detailsInput!
        ): LoginType!
        signIn(email: String!, password: String!, deviceToken: String!): LoginType!
        updateUserProfile(uuid: ID!, role: Role!, userDetails: detailsInput): QueryType!
        deleteUserProfile(uuid: ID!): QueryType!
        createPet(name: String!, breed: String!, age: Int!, gender: Gender): QueryType!
        updatePet(uuid: ID!, name: String!, breed: String!, age: Int!): QueryType!
        deletePet(uuid: ID!): QueryType!
        findPet(uuid: ID!): QueryType!
        findCaregiver(name: String): QueryType!
        createReview(caregiverUuid: ID!, rating: Int!, comment: String!): QueryType!
        deleteReview(uuid: ID!): QueryType!
        favoriteCaregiver(caregiverUuid: ID!): QueryType!
        unfavoriteCaregiver(caregiverUuid: ID!): QueryType!
        requestHired(caregiverUuid: ID!, petUuid: ID!): QueryType!
        cancelRequest(requestUuid: ID!): QueryType!
        acceptRequest(requestUuid: ID!): QueryType!
        rejectRequest(requestUuid: ID!): QueryType!
        complateRequest(requestUuid: ID!): QueryType!
    }
`;

export default typeDefs;
