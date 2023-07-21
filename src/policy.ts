import { Policy } from './fga-type';

export const policies: Policy[] = [
  { subj: 'OAuth:User' }, // define a subject called 'OAuth:User'
  {
    subj: 'Org:Profile', // define a subject called 'Org:Profile'
    rels: { // collection of relation for subject 'Org:Profile'
      owner: 'OAuth:User', // 'Org:Profile' has owner is a 'OAuth:User'
      parent: 'Org:Profile',
      /**
       * - admin of 'Org:Profile' has type of 'OAuth:User'.
       * - owner of 'Org:Profile' have all permission of admin.
       */
      admin: ['OAuth:User', 'owner'],
      /**
       * - member of 'Org:Profile' has type of 'OAuth:User'.
       * - owner of 'Org:Profile' have all permission of member.
       */
      member: ['OAuth:User', 'admin'],
      /**
       * - editor of 'Org:Profile' has type of 'OAuth:User'.
       * - owner of 'Org:Profile' have all permission of editor.
       */
      editor: ['OAuth:User', 'admin'],
    },
  },
  {
    subj: 'FM:Folder',
    rels: {
      owner: 'Org:Profile', // owner of 'FM:Folder' has type of 'Org:Profile'
      parent: 'FM:Folder', // parent of 'FM:Folder' is also a 'FM:Folder'
      /**
       * - creator of 'FM:Folder' has type 'OAuth:User'.
       * - 'parent>creator' - (creator of parent folder) have all permissions of sub folder creator.
       * Note: parent of 'FM:Folder' is also a 'FM:Folder' so this is recursive relationship
       */
      creator: ['OAuth:User', 'parent>creator'],
      /**
       * This is alias relation, alias relation is a relation created by using other relation.
       * 
       * Let inspect this string 'parent>owner>admin', this is a chain recursive relation ship:
       * - 'parent' is 'FM:Folder'
       * - 'owner' of 'FM:Folder' is 'Org:Profile'
       * -> 'parent>owner' equal to 'Org:Profile'
       * - 'admin' of 'Org:Profile' is 'OAuth:User'
       * => 'parent>owner>admin' equal to all admin of 'Org:Profile'(aka organization admin)
       */
      orgAdmin: 'parent>owner>admin',

      /**
       * Similar to as above relation.
       * 'parent>owner>editor' mean all editors of 'Org:Profile'.
       */
      orgEditor: 'parent>owner>editor',

      /**
       * activeCreator is a creator of the 'FM:Folder' AND he is also a orgEditor.
       * Note: this alias relation is used to prevent a user from doing anything as a creator of the folder after he was remove from editor role.
       */
      activeCreator: 'creator&orgEditor',
    },
  },
  {
    subj: 'FM:File',
    rels: {
      parent: 'FM:Folder', // parent of 'FM:File' is a 'FM:Folder'
      creator: 'OAuth:User', // creator of 'FM:File' is a 'OAuth:User' (aka a user)
      folderCreator: 'parent>creator',
      org: 'parent>parent>owner',
      orgOwner: 'org>owner', // alias relation for organization owner(OAuth:User) of this 'FM:File'
      orgMember: 'org>member',
      activeCreator: 'creator&orgMember',
      viewer: ['OAuth:User', 'creator', 'orgMember', 'orgOwner'],
    },
  },
];