export interface IClientRepoForAuth {
    isClientPaidByUserInfo(userId: string): Promise<Boolean>
}