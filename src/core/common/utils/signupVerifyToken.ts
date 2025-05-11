import * as uuid from 'uuid';

export async function signupVerifyTokenCreate() {
    return uuid.v1();
}