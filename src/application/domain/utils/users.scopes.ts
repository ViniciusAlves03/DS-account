export abstract class UsersScopes {
    public static readonly ADMIN: Array<string> = [
        'au:pw',                                                                  // auth
        'ad:c', 'ad:ra', 'ad:r', 'ad:u',                                          // admins
        'ho:c', 'ho:ra', 'ho:r', 'ho:u', 'ho:d', 'ho:dp:c', 'ho:dp:u', 'ho:dp:d', // holders
        'dp:ra', 'dp:r', 'dp:u', 'dp:d',                                          // dependents
        'us:ra', 'us:d', 'us:av:c', 'us:av:r', 'us:av:d'                          // users
    ]
    public static readonly HOLDER: Array<string> = [
        'au:pw',                                                 // auth
        'ho:r', 'ho:u', 'ho:d', 'ho:dp:c', 'ho:dp:u', 'ho:dp:d', // holders
        'dp:ra', 'dp:r', 'dp:u', 'dp:d',                         // dependents
        'us:av:c', 'us:av:r', 'us:av:d'                          // users
    ]
    public static readonly DEPENDENT: Array<string> = [
        'au:pw',                         // auth
        'dp:r', 'dp:u', 'dp:d',          // dependents
        'us:av:c', 'us:av:r', 'us:av:d', // users
    ]

    public static getUserScopes(type: string): Array<string> {
        return {
            admin: () => UsersScopes.ADMIN,
            holder: () => UsersScopes.HOLDER,
            dependent: () => UsersScopes.DEPENDENT
        }[type]()
    }
}
