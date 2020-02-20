import { Injectable, ConfigProvider } from "@pskl/di-core";

export class User {
  constructor(public name: string, public password: string, public role: string) { }
  toJSON() {
    return { name: this.name, role: this.role }
  }
}
const users = [
  { name: 'John Doe', role: 'super', password: 'qwerty9' },
  { name: 'Jane Doe', role: 'admin', password: 'qwerty8' },
]

@Injectable()
export class AuthService {
  private users: Array<User> = users.map(({name, role, password}) => new User(name, password, role));
  constructor(public config: ConfigProvider) { }

  addUser({ name, password, role }: User): void {
    this.users.push(new User(name, password, role))
  }

  getUsers() {
    return this.users
  }
  getUser(uName: string): any {
    return this.users.find(({ name }) => name == uName)
  }
}