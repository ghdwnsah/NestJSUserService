export interface IClientRepoForCore {
    isClientPaid(id: string): Promise<boolean>
}