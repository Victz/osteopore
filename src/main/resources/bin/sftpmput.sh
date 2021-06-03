#!/bin/sh
# Program Name: sftpmput.sh
# Description: SFTP sent bulk files
# PARM1: SFTPID
# PARM2: SFTPHOST
# PARM3: LOCALDIR
# PARM4: REMOTEDIR
# PARM5: [ARCHIVEDIR]
###################################################################################################

if [[ -z $1 || -z $2 || -z $3 || -z $4 ]]; then
  echo "Usage: sftpmput.sh SFTPID SFTPHOST LOCALDIR REMOTEDIR [ARCHIVEDIR]"
  exit 1
fi

SFTPID=$1
SFTPHOST=$2
LOCALDIR=$3
REMOTEDIR=$4

if [ ! -z $5 ]; then
  ARCHIVEDIR=$5
else
  ARCHIVEDIR=$LOCALDIR"/archive"
fi

if [ ! -d $LOCALDIR ]; then
  echo "[ERROR] $LOCALDIR doesn't exist"
fi

./app/bin/env.sh
JOBNAME=$(basename $0 | awk -F. '{print $1}')
LOGFILE=$LOGDIR"/"$JOBNAME".log"

if [ ! -f $LOGFILE ]; then
  if [ ! -d $LOGDIR ]; then
    mkdir -p $LOGDIR
  fi
  echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Creating new log file" | tee $LOGFILE
else
  LOGSIZE=$(ls -l $LOGFILE | awk '{print $5}')
  echo "LOGSIZE: " $LOGSIZE | tee $LOGFILE
  if [ $LOGSIZE -ge $MAXLOGSIZE ]; then
    echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Archiving log file" | tee -a $LOGFILE
    mv $LOGFILE $LOGFILE.bak
    echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Creating new log file" | tee $LOGFILE
  fi
fi

echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Job $JOBNAME Started" | tee -a $LOGFILE
echo "PGMDIR:" $PGMDIR | tee -a $LOGFILE
echo "LOGDIR: " $LOGDIR | tee -a $LOGFILE
echo "MAXLOGSIZE: " $MAXLOGSIZ | tee -a $LOGFILE
echo "ALERTMAIL: " $ALERTMAIL | tee -a $LOGFILE
echo "LOGFILE: " $LOGFILE | tee -a $LOGFILE
echo "SFTPID: " $SFTPID | tee -a $LOGFILE
echo "SFTPHOST: " $SFTPHOST | tee -a $LOGFILE
echo "LOCALDIR: " $LOCALDIR | tee -a $LOGFILE
echo "REMOTEDIR: " $REMOTEDIR | tee -a $LOGFILE
echo "ARCHIVEDIR: " $ARCHIVEDIR | tee -a $LOGFILE

COUNT=$(ls -l "$LOCALDIR" | grep ^- | wc -l)
if [ $COUNT -eq 0 ]; then
  echo $(date '+%Y%m%d %H:%M:%S') "[INFO] No file found in sftp local directory: $LOCALDIR" | tee -a $LOGFILE
  exit
fi
echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Total files ready to send: $COUNT" | tee -a $LOGFILE

echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Creating sftp file list and sftp batch..." | tee -a $LOGFILE
SFTPBATCH=$LOGDIR"/"$JOBNAME.$$
SFTPLIST=$SFTPBATCH".list"
SFTPLOG=$SFTPBATCH".log"
echo "SFTPBATCH: " $SFTPBATCH | tee -a $LOGFILE
echo "SFTPLIST: " $SFTPLIST | tee -a $LOGFILE
echo "SFTPLOG: " $SFTPLOG | tee -a $LOGFILE

for FILE in $(ls -l "$LOCALDIR" | grep ^- | tr -s ' ' | awk '{print $NF}'); do
  SIZE1=$(ls -l "$LOCALDIR/$FILE" | awk '{print $5}')
  sleep 1
  SIZE1=$(ls -l "$LOCALDIR/$FILE" | awk '{print $5}')
  if [ $SIZE1 -eq $SIZE2 ]; then
    echo "$FILE" >>$SFTPLIST
    echo $(date '+%Y%m%d %H:%M:%S') "[INFO] File added to sftp list: $FILE" | tee -a $LOGFILE
  else
    echo $(date '+%Y%m%d %H:%M:%S') "[WARNING] File skipped. Transfer still in progress: $FILE, SIZE1: $SIZE1, SIZE2: $SIZE2" | tee -a $LOGFILE
  fi
done

echo "lcd $LOCALDIR" >$SFTPBATCH
echo "lpwd" >>$SFTPBATCH
echo "lls -l" >>$SFTPBATCH
echo "cd $REMOTEDIR" >>$SFTPBATCH
echo "pwd" >>$SFTPBATCH
echo "ls -l" >>$SFTPBATCH
for FILE in $(cat $SFTPLIST); do
  echo "put $FILE" >>$SFTPBATCH
  echo "chmod 664 $FILE" >>$SFTPBATCH
done
echo "ls -l" >>$SFTPBATCH
echo "quit" >>$SFTPBATCH

sftp -b $SFTPBATCH $SFTPID@SFTPHOST |& tee -a $SFTPLOG $LOGFILE
SENT=$(cat $SFTPLOG | grep chmod | wc -l)
if [ $SENT -eq $COUNT ]; then
  echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Total files sent: $SENT" | tee -a $LOGFILE
  if [ ! -d "$ARCHIVEDIR" ]; then
    mkdir -p "$ARCHIVEDIR"
    chmod 775 "$ARCHIVEDIR"
  fi
  for FILE in $(cat $SFTPLIST); do
    echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Archiving $FILE to $ARCHIVEDIR ..." | tee -a $LOGFILE
    mv "$LOCALDIR/$FILE" "$ARCHIVEDIR/$FILE."$(date '+%Y%m%d%H%M%S')
  done
  rm "$SFTPLOG" "$SFTPLIST" "SFTPBATCH"
  echo $(date '+%Y%m%d %H:%M:%S') "[INFO] Job $JOBNAME completed successfully" | tee -a $LOGFILE
else
  echo $(date '+%Y%m%d %H:%M:%S') "[ERROR] Job $JOBNAME failed in $HOSTNAME" | tee -a $LOGFILE
  echo "[ERROR] Job $JOBNAME failed" | mail -s "[ERROR] Job $JOBNAME failed in $HOSTNAME" $ALERTMAIL |& tee -a $LOGFILE
fi
