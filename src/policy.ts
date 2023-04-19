import { Policy } from './fga-type';

export const policies: Policy[] = [
  { subj: 'IAM:Profile' }, // define a subject called 'IAM:Profile'
  {
    subj: 'Org:Profile', // define a subject called 'Org:Profile'
    rels: { // collection of relation for subject 'Org:Profile'
      owner: 'IAM:Profile', // 'Org:Profile' has owner is a 'IAM:Profile'
      parent: 'Org:Profile',
      /**
       * - admin of 'Org:Profile' has type of 'IAM:Profile'.
       * - owner of 'Org:Profile' have all permission of admin.
       */
      admin: ['IAM:Profile', 'owner'],
      /**
       * - member of 'Org:Profile' has type of 'IAM:Profile'.
       * - owner of 'Org:Profile' have all permission of member.
       */
      member: ['IAM:Profile', 'admin'],
      /**
       * - editor of 'Org:Profile' has type of 'IAM:Profile'.
       * - owner of 'Org:Profile' have all permission of editor.
       */
      editor: ['IAM:Profile', 'admin'],
    },
    acts: { // collection of action for subject 'Org:Profile'
      appointAdmin: 'owner', // only owner of 'Org:Profile' can 'appointAdmin'
      removeAdmin: 'owner', // only owner of 'Org:Profile' can 'removeAdmin'
      deleteOrg: 'owner', // only owner of 'Org:Profile' can 'deleteOrg'
      acceptJoinRequest: 'admin', // only admin of 'Org:Profile' can 'acceptJoinRequest'
      rejectJoinRequest: 'admin', // only admin of 'Org:Profile' can 'rejectJoinRequest'
      inviteMember: 'admin', // only admin of 'Org:Profile' can 'inviteMember'
      removeMember: 'admin', // only admin of 'Org:Profile' can 'removeMember'
    },
  },
  {
    subj: 'FM:Folder',
    rels: {
      owner: 'Org:Profile', // owner of 'FM:Folder' has type of 'Org:Profile'
      parent: 'FM:Folder', // parent of 'FM:Folder' is also a 'FM:Folder'
      /**
       * - creator of 'FM:Folder' has type 'IAM:Profile'.
       * - 'parent>creator' - (creator of parent folder) have all permissions of sub folder creator.
       * Note: parent of 'FM:Folder' is also a 'FM:Folder' so this is recursive relationship
       */
      creator: ['IAM:Profile', 'parent>creator'],
      /**
       * This is alias relation, alias relation is a relation created by using other relation.
       * 
       * Let inspect this string 'parent>owner>admin', this is a chain recursive relation ship:
       * - 'parent' is 'FM:Folder'
       * - 'owner' of 'FM:Folder' is 'Org:Profile'
       * -> 'parent>owner' equal to 'Org:Profile'
       * - 'admin' of 'Org:Profile' is 'IAM:Profile'
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
    acts: {
      create: ['orgEditor&IAM:Profile', 'orgAdmin'], // only 'orgEditor' or 'orgAmin' can create 'FM:Folder'
      delete: 'activeCreator' // only 'activeCreator' or 'orgAmin' can delete 'FM:Folder'
    },
  },
  {
    subj: 'FM:File',
    rels: {
      parent: 'FM:Folder', // parent of 'FM:File' is a 'FM:Folder'
      creator: 'IAM:Profile', // creator of 'FM:File' is a 'IAM:Profile' (aka a user)
      folderCreator: 'parent>creator',
      org: 'parent>parent>owner',
      orgOwner: 'org>owner', // alias relation for organization owner(IAM:Profile) of this 'FM:File'
      orgMember: 'org>member',
      activeCreator: 'creator&orgMember',
      viewer: ['IAM:Profile', 'creator', 'orgMember', 'orgOwner'],
    },
    acts: {
      view: 'viewer',
      // creator, folderCreator and orgOwner can delete file
      delete: ['creator', 'folderCreator', 'orgOwner'],
    },
  },
];